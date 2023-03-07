import Lazy from "./lazy"

export default {
  install(Vue, options){
    const isVue2 = Vue.version.split('.')[0] === '2'
    if(isVue2){
      const LazyClass = Lazy(Vue)
      const lazy = new LazyClass(options)

      Vue.directive('lazy', {
        bind: lazy.add.bind(lazy),
        update: lazy.update.bind(lazy),
        unbind: lazy.remove.bind(lazy)
      })
    }
  }
}