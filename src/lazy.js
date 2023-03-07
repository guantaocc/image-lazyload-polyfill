import { throttle } from "throttle-debounce"
import  ReactiveListener from './ReactiveListener'

export default function Lazy(Vue){
  return class Lazy {
    constructor(options){
      this.options = options || {}
      this.version = '__VUE_LAZYLOAD_VERSION__'
      this.listenerQueue = []
      this.initEvents()
      this.initIntersetionObserser()
      this.lazyLoadHandler = throttle(this._lazyLoadHandler.bind(this), this.options.throttleWait || 200)
    }
    
    _lazyLoadHandler(){}
    initIntersetionObserser(){
      this._observer = new IntersectionObserver(this._observerHandler.bind(this), {
        rootMargin: '0px',
        threshold: 0
      })
      if(this.listenerQueue.length){
        this.listenerQueue.forEach(listener => {
          this._oberver.observe(listener.el)
        })
      }
    }

    _observerHandler (entries, observer) {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          // 加载
          this.listenerQueue.forEach(listener => {
            if (listener.el === entry.target) {
              console.log('entried',)
              if (listener.state.loaded) return this._observer.unobserve(listener.el)
              listener.load()
            }
          })
        }
      })
    }

    initEvents(){
      this.Event = {
        listeners: []
      }
      this.$on = (event, fn) => {
        if(!this.Event.listeners[event]) this.Event.listeners[event] = []
        this.Event.listeners[event].push(fn)
      }
      this.$off = (event, fn) => {
        if (!func) {
          if (!this.Event.listeners[event]) return
          this.Event.listeners[event].length = 0
          return
        }
        const index = this.Event.listeners[event].indexOf(fn)
        if(index !== -1){
          this.Event.listeners.splice(index, 1)
        }
      }
      this.$emit = (event, context) => {
        if(!this.Event.listeners[event]) return
        this.Event.listeners[event].forEach(fn => {
          fn.apply(null, context)
        })
      }
      this.$once = (event, fn) => {
        const vm = this
        function on(){
          vm.$off(event, fn)
          fn.apply(vm, arguments)
        }
        this.$on(event, on)
      }
    }
    add(el, binding, modifiers){
      // init intersections
      Vue.nextTick(() => {
        console.log('add element')
        let src = binding.value
        this._observer && this._observer.observe(el)
        // init state cache
        const reactiveListener = new ReactiveListener(el, src)
        this.listenerQueue.push(reactiveListener)
      })
    }
    update(el){}
    remove(el){}
  }
}