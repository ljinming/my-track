import { OPTIONS } from "../type";
import { baseUUid, emit, supported } from "./base";
import { createObserver, normalizePerformanceRecord } from "./utils";
import EventEmitter from "./EventEmitter";





/**
 * 发送首次页面性能数据
 */
function observeNavigationTiming() { 
  const times: Record<string,any>= {
    fmp: 0,
  };
  const { performance } = window;
  let timing: PerformanceTiming | PerformanceEntry | PerformanceNavigationTiming | any = performance.timing;
  
  if (supported.getEntriesByType) {
    const paintEntries = performance.getEntriesByType('paint');
    if (paintEntries.length) times.fmp = paintEntries[paintEntries.length - 1].startTime;

     //优先使用 navigation v2 
    if (supported.PerformanceNavigationTiming) { 

      const nt2Timing = performance.getEntriesByType('navigation')[0];
    if (nt2Timing) timing = nt2Timing;
    }

  }
  // 白屏时间 (从请求开始到浏览器开始解析第一批HTML文档字节的时间差)
  times.fpt = timing.responseEnd - timing.fetchStart;

   // 从开始发起这个页面的访问开始算起,减去重定向跳转的时间,在performanceV2版本下才进行计算,v1版本的fetchStart是时间戳而不是相对于访问起始点的相对时间
  //if (times.fmp && supported.PerformanceNavigationTiming) times.fmp -= timing.fetchStart;

  times.tti = timing.domInteractive - timing.fetchStart; // 首次可交互时间

  times.ready = timing.domContentLoadedEventEnd - timing.fetchStart; // HTML加载完成时间

 times.loadon = timing.loadEventStart - timing.fetchStart; // 页面完全加载时间

  times.firstbyte = timing.responseStart - timing.domainLookupStart; // 首包时间

  times.dns = timing.domainLookupEnd - timing.domainLookupStart; // dns查询耗时

  times.appcache = timing.domainLookupStart - timing.fetchStart; // dns缓存时间

  times.tcp = timing.connectEnd - timing.connectStart; // tcp连接耗时
    
    times.ttfb = timing.responseStart - timing.requestStart; // 请求响应耗时

  times.trans = timing.responseEnd - timing.responseStart; // 内容传输耗时

  times.dom = timing.domInteractive - timing.responseEnd; // dom解析耗时

  times.res = timing.loadEventStart - timing.domContentLoadedEventEnd; // 同步资源加载耗时

  times.ssllink = timing.connectEnd - timing.secureConnectionStart; // SSL安全连接耗时

  times.redirect = timing.redirectEnd - timing.redirectStart; // 重定向时间

  times.unloadTime = timing.unloadEventEnd - timing.unloadEventStart; // 上一个页面的卸载耗时
  sendFristData('calc',times);
}


// 首屏性能数据发送
function sendFristData(type:string,timesData: Record<string, any>) {
  const times =type === 'observer'? timesData:{
    firstPaint: timesData['first-paint'].startTime, //白屏时间
    firstContentfulPaint: timesData['first-contentful-paint'].startTime, //首屏
    sslLinkTimes :timesData['navigation'].connectEnd - timesData['navigation'].secureConnectionStart, // SSL安全连接耗时
    redirectTimes :timesData['navigation'].redirectEnd - timesData['navigation'].redirectStart, // 重定向时间
    unLoadTime :timesData['navigation'].unloadEventEnd - timesData['navigation'].unloadEventStart// 上一个页面的卸载耗时
  }
  emit({
  type: 'performance',
  subType: 'document',
  data:normalizePerformanceRecord({
    ...times,
  }),
  uuid:baseUUid,
});
}




function init(_options: OPTIONS) { 
  const { performanceFirstResource,performanceCore} = _options;
  if (!performanceFirstResource && !performanceCore) return
  //'longtask','frame','navigation','resource','mark','measure',
  if (supported.PerformanceObserver) {
    createObserver({ entryTypes: ['paint', 'navigation'] }).then((res:any) => { 
       // 页面加载完毕事件，发送首屏渲染数据
    sendFristData('observer',res)
    })
  
  } else { 
    observeNavigationTiming()
  }

}

export default { init }


