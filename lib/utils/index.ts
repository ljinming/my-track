import EventEmitter from "../EventEmitter";

/**
 * 格式化性能记录,小数位数保留最多两位,等于0的字段不传输,标记为undefined
 */
export function normalizePerformanceRecord(e:Record<string,any>):Record<string,any>  {
  Object.keys(e).forEach((p) => {
    const v = e[p];
    if (typeof v === 'number') e[p] = v === 0 ? undefined : parseFloat(v.toFixed(2));
  });
  return e;
}

/*
随机uuid
*/
export function getUUid (){ 
    return new Date().getTime()
}
/*
map
*/

const arrayMap = Array.prototype.map || function polyfillMap(fn) {
  const result = [];
  for (let i = 0; i < this.length; i += 1) {
    result.push(fn(this[i], i, this));
  }
  return result;
};

export function map(arr, fn) {
  return arrayMap.call(arr, fn);
}

/**
 * filter方法
 * @param {Array} arr 源数组
 * @param {Function} fn 条件函数
 * @returns 
 */

const arrayFilter = Array.prototype.filter || function filterPolyfill(fn) {
  const result = [];
  for (let i = 0; i < this.length; i += 1) {
    if (fn(this[i], i, this)) {
      result.push(this[i]);
    }
  }
  return result;
};

export function filter(arr, fn) {
  return arrayFilter.call(arr, fn);
}



/*
PerformanceObserver 获取相关信息
*/
export function createObserver(params,addEmit?:string,values?:Record<string,any>) {
   const observePerformance:Record<string,any> = {}
 return new Promise((resolve, reject) => {
   const observer = new PerformanceObserver( async (list: any) => {
    for await (const entry of list.getEntries()) {
       if (entry.entryType === 'navigation') {
         observePerformance[entry.entryType] = {
           ...entry.toJSON()
         }
       } else if (entry.entryType === 'resource') {
         if (entry.initiatorType === "xmlhttprequest") {
           // api 请求
           if (entry.name.includes("api/")) {
             observePerformance.resource = observePerformance.resource || {}
             observePerformance.resource[entry.name] = {
               ...entry.toJSON()
             }
           }
         }
       } else {
         observePerformance[entry.name] = {
           name: entry.name,
           entryType: entry.entryType,
           startTime: entry.startTime,
           duration: entry.duration
         }
       }
     
     }
     resolve(observePerformance);
      let lastValue = values;
     if (addEmit && observePerformance[addEmit] && JSON.stringify(lastValue) !== JSON.stringify(observePerformance[addEmit])) { 
       lastValue = { ...observePerformance[addEmit] }
       console.log('---343245',observePerformance[addEmit])
       EventEmitter.emit(addEmit,observePerformance[addEmit])
     }
     
   })
    observer.observe(params)
 })
}


export const sendBeacon = navigator.sendBeacon
  ? (url, data) => {
    if (data) navigator.sendBeacon(url, JSON.stringify(data));
  }
  : (url, data) => {
    // 传统方式传递参数
    const beacon = new Image();
    beacon.src = `${url}?v=${encodeURIComponent(JSON.stringify(data))}`;
  };

  /**
 * 可以理解为异步执行
 * requestIdleCallback 是浏览器空闲时会自动执行内部函数
 * requestAnimationFrame 是浏览器必须执行的
 * 关于 requestIdleCallback 和  requestAnimationFrame 可以参考 https://www.cnblogs.com/cangqinglang/p/13877078.html
 */
export const nextTime = window.requestIdleCallback || window.requestAnimationFrame || ((callback) => setTimeout(callback, 17));


/*
之前看过一个段子，两个人一同去网吧包夜，一个人玩了一晚上的扫雷，而另一个则看着他玩了一晚上的扫雷。
咋一听来，这个游戏是在嘲讽"扫雷"游戏的无聊，但反过来想不也正说明"扫雷"很有魅力。
扫雷就像是一道数学推理题，游戏的乐趣就在于思考和推理，稳中求快，
*/

// 扫雷这题的目标就是全面皆玩，不管通不通关，大家看到这道题的第一眼就知道怎么玩了，为了增加难度，也是
//闯关的难点 估计就是雷比较多了，150个雷，想要通关还是需要点技巧的，稳重求快，高效的做对的事，才能