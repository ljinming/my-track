export interface OPTIONS { 
    requestUrl: string,
    appName: string,
    pv?: boolean,
    title?: string,
    eventCore?: boolean, // 页面点击-是否采集点击事件
    eventUnload?: boolean, // 页面卸载-是否在页面卸载时采集页面状态信息
    performanceCore?: boolean, // 性能数据-是否采集静态资源、接口的相关数据
    performanceFirstResource?: boolean, // 性能数据-是否采集首次进入页面的数据(ps: tcp连接耗时,HTML加载完成时间,首次可交互时间)
    performanceServer?: boolean, //api 接口数据是否收集
    errorServer?:boolean, //报错收集
}
export interface emitOptiosn { 
    type: string,
    subType: string,
}

export interface PV_OPTIONS { 
    url: string, //当前url,
    refer: string, //上层url, 从何而来，
    action: number|string,//页面加载来源方式
    size?: string
    title?: string,
}

export interface DATA_OPTIONS { 
    type: string,
    subType: string,
    uuid: string |number,
    data: Record<string, any>
    triggerTime?:string|number
}

// enum action_type {
//     navigate = 0,
//     Down,
//     Left,
//     Right
// }