

//用户行为监控

import { OPTIONS } from "../type";

function clickCollection() { 
    //采集点击事件
    // window.addEventListener('click', (e) => { 
    //     //
    //     console.log('====3',e)
    // })
}



function init(_options:OPTIONS) {
    const { eventCore } = _options;
    if (eventCore) { 
        // 采集点击事件
        clickCollection();
    }


}



function removeEvent() { 
    //去除所有的监听事件
}

export default { init } 