
import { OPTIONS } from "../type";
import { baseUUid, emit, supported } from "./base";
import EventEmitter from "./EventEmitter";
import { createObserver, normalizePerformanceRecord } from "./utils";


let lastResource = {};

class RequestTemplate {
  requestMethod: string;
    src: string | URL;
    triggerTime: number;
  constructor(config = {}) {
    const list = ['src', 'method', 'duration', 'responseStatus'];
    list.forEach((key) => { this[key] = config[key] || null; });
  }
}


/**
 * 主动触发性能事件上报
 * @param {*} eventId 事件ID
 * @param {*} options 自定义配置信息
 */

function tracePerformance(tyep: string, options?: Record<string, any>) {
    let showOpts = {};
    if (tyep === 'server') {
        showOpts = options
    } else { 
        const time = Date.now();
        Object.keys(options).forEach(key => { 
        showOpts[key] = {
        triggerTime:time,
        url: window.location.href,
        apiTimes: options[key].startTime, //api 耗时
        durationTimes: options[key].duration,//发送api 的时间
        responseEndTime: options[key].responseEnd,//api 返回结果的时间
      }; 
    });
    }


   
 
  emit({
    type: 'performance',
    subType: 'resourceApi',
    uuid: baseUUid,
    triggerTime: Date.now(),
    data:normalizePerformanceRecord(showOpts),
  });
}

/**
 * ajax, axios请求拦截
 */
function interceptAjax() {
  const { open, send } = XMLHttpRequest.prototype;
  const _config = new RequestTemplate();

  // 劫持 open方法
//   XMLHttpRequest.prototype.open = function openXHR(method, url, async) {
//     _config.requestMethod = method;
//     _config.src = url;
//     return open.call(this, method, url, async);
//   };

  // 劫持 send方法
    XMLHttpRequest.prototype.send = function (body) {
      console.log('=========3',body)
    // body 就是post方法携带的参数

    // readyState发生改变时触发,也就是请求状态改变时
    // readyState 会依次变为 2,3,4 也就是会触发三次这里
    this.addEventListener('readystatechange', () => {
      const {
        readyState,
        status,
        responseURL = _config.src,
        responseText,
      } = this;
      if (readyState === 4) { // 请求已完成,且响应已就绪
        if (status === 200 || status === 304) {
            tracePerformance('server', {
              url: responseURL,
              responseStatus: status,
              duration: Date.now() - _config.triggerTime,
              params: body ? body : undefined,
            });
        } else {
          tracePerformance('server', {
            url: responseURL,
            responseStatus: status,
            duration: Date.now() - _config.triggerTime,
            params: body ? body : undefined,
          });
        }
      }
    });

    _config.triggerTime = Date.now();
    return send.call(this, body);
  };
}


function init(_options: OPTIONS) { 

    // EventEmitter.on('resource', (values) => {
    //  //   console.log('=resource------------values', values)
    //     lastResource = values
    //     debugger
    //     tracePerformance(values)
    // },true)
    
    const { performanceServer, errorServer } = _options;
    if (!performanceServer && !errorServer) return;
  //'longtask','frame','navigation','resource','mark','measure',
   
    // createObserver({ entryTypes: ['resource'] }, ).then(res => {
    //     console.log('===3',res)
    // })
interceptAjax();


}

export default {
  init,};