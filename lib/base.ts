/**
 * 上报类型
 * {
 *     type:'',大类
 *     subType: ,小类
 *
 * }
 *
 * @format
 */

interface Supported {
  performance: boolean;
  getEntriesByType: boolean;
  PerformanceObserver: boolean;
  MutationObserver: boolean;
  PerformanceNavigationTiming: boolean; //PerformanceNavigationTiming 提供了用于存储和检索有关浏览器文档事件的指标的方法和属性。例如，此接口可用于确定加载或卸载文档需要多少时间
}

// 兼容判断
export const supported: Supported = {
  performance: !!window.performance,
  getEntriesByType: !!(window.performance && performance.getEntriesByType),
  PerformanceObserver: 'PerformanceObserver' in window,
  MutationObserver: 'MutationObserver' in window,
  PerformanceNavigationTiming: 'PerformanceNavigationTiming' in window,
  // PerformanceTiming:'PerformanceTiming' in window,
};

import { DATA_OPTIONS, OPTIONS } from '../type';
import { getUUid, map, nextTime, sendBeacon } from './utils';
import { DEBUG_LOG, MAX_CACHE_LEN, MAX_WAITING_TIME } from './utils/constans';

// 当前应用ID,在整个页面生命周期内不变,单页应用路由变化也不会改变,加载SDK时创建,且只创建一次
const baseUUid = getUUid();
let reqUrl = '';
let events = []; // 批次队列
let timer = null; // 定时发送定时器

const base = {
  // 基础数据
  pageId: baseUUid,
  appName: '',
};

const init = (_options: OPTIONS) => {
  const { appName, requestUrl } = _options;
  reqUrl = requestUrl;
  base.appName = appName;
};

/**
 * 记录需要发送的埋点数据
 * @param {*} e 需要发送的事件信息
 * @param {boolean} flush 是否立即发送
 */
function emit(e, flush = false) {
  events = events.concat(e); // 追加到事件队列里
  clearTimeout(timer);

  // 满足最大记录数,立即发送,否则定时发送(flush为true代表立即发送)
  events.length >= MAX_CACHE_LEN || flush
    ? send()
    : (timer = setTimeout(() => {
        send();
      }, MAX_WAITING_TIME));
}

/**
 * 发送埋点信息
 */
function send() {
  if (events.length) {
    // 选取首部的部分数据来发送,performance会一次性采集大量数据追加到events中
    const sendEvents = events.slice(0, MAX_CACHE_LEN); // 需要发送的事件
    events = events.slice(MAX_CACHE_LEN); // 剩下待发的事件
    debug('send events', sendEvents);

    const time = Date.now();
    sendBeacon(reqUrl, {
      baseInfo: { ...base, sendTime: time },
      eventInfo: map(sendEvents, (e) => {
        e.sendTime = time; // 设置发送时间

        // 补充type字段,将click、scroll、change、submit事件作为一类存储
        if (
          e.eventType === 'click' ||
          e.eventType === 'scroll' ||
          e.eventType === 'submit' ||
          e.eventType === 'change'
        ) {
          e.type = 'mix';
          return e;
        }

        if (e.eventType === 'performance') {
          // 将性能进行分类,不同类型的性能数据差异较大,分开存放,资源、页面、请求
          switch (e.eventId) {
            case 'resource':
              e.type = 'resourcePerformance';
              break;
            case 'page':
              e.type = 'pagePerformance';
              break;
            case 'server':
              e.type = 'serverPerformance';
              break;
            default:
              break;
          }
          return e;
        }
        e.type = e.eventType; // 其他类型type同eventType
        return e;
      }),
    });
    if (events.length) nextTime(send); // 继续传输剩余内容,在下一个时间择机传输
  }
}

/**
 * 控制台输出信息
 * @param  {...any} args 输出信息
 */
function debug(...args) {
  if (DEBUG_LOG) console.log(...args);
}

export { emit, baseUUid, init };
export default {
  init,
};
