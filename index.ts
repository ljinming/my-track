import pv from "./lib/pv";
import event from "./lib/event";
import performance from "./lib/performance";
import http from './lib/http';
import base from "./lib/base";
import { OPTIONS } from "./type";


const init = (_options: OPTIONS) => {
    base.init(_options)
    pv.init(_options);
    event.init(_options)
    performance.init(_options)
    http.init(_options)
};
  
export default {init}