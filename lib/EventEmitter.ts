 class EventEmitter {
  events: {};
  constructor() {
    this.events = {};
  }
    
    
  on(type:string, listener:Function,  isOneShot?:boolean,isUnshift?:boolean) {
    // 因为其他的类可能继承自EventEmitter，子类的events可能为空，保证子类必须存在此实例属性
    if(!this.events) {
      this.events = {};
    }
      if (this.events[type]) {
          if (isOneShot) {
                this.events[type]=[listener]
          } else { 
            if(isUnshift) {
                    this.events[type].unshift(listener);
                } else {
                    this.events[type].push(listener);
                }
        }
     
    } else {
      this.events[type] = [listener]
    }
  }
    
  emit(type, ...args) {
      if (this.events[type]) {
      this.events[type].forEach(fn => fn.call(this, ...args));
    }
  }
    

  // 只绑定一次，然后解绑
  once(type:string, listener:Function) {
      const self = this;
    function oneTime(...args) {
        listener.call(this, ...args);
      self.off(type, oneTime);
    }
    self.on(type, oneTime)
  }
    
  off(type:string, listener:Function) {
    if(this.events[type]) {
      const index = this.events[type].indexOf(listener);
      this.events[type].splice(index, 1);
    }
  }
}


export default new EventEmitter()