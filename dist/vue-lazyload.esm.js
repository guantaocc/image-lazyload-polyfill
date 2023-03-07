/*!
 * Vue-Lazyload.js v1.0.0
 * (c) 2023 guantao
 * Released under the MIT License.
 */

/* eslint-disable no-undefined,no-param-reassign,no-shadow */

/**
 * Throttle execution of a function. Especially useful for rate limiting
 * execution of handlers on events like resize and scroll.
 *
 * @param {number} delay -                  A zero-or-greater delay in milliseconds. For event callbacks, values around 100 or 250 (or even higher)
 *                                            are most useful.
 * @param {Function} callback -               A function to be executed after delay milliseconds. The `this` context and all arguments are passed through,
 *                                            as-is, to `callback` when the throttled-function is executed.
 * @param {object} [options] -              An object to configure options.
 * @param {boolean} [options.noTrailing] -   Optional, defaults to false. If noTrailing is true, callback will only execute every `delay` milliseconds
 *                                            while the throttled-function is being called. If noTrailing is false or unspecified, callback will be executed
 *                                            one final time after the last throttled-function call. (After the throttled-function has not been called for
 *                                            `delay` milliseconds, the internal counter is reset).
 * @param {boolean} [options.noLeading] -   Optional, defaults to false. If noLeading is false, the first throttled-function call will execute callback
 *                                            immediately. If noLeading is true, the first the callback execution will be skipped. It should be noted that
 *                                            callback will never executed if both noLeading = true and noTrailing = true.
 * @param {boolean} [options.debounceMode] - If `debounceMode` is true (at begin), schedule `clear` to execute after `delay` ms. If `debounceMode` is
 *                                            false (at end), schedule `callback` to execute after `delay` ms.
 *
 * @returns {Function} A new, throttled, function.
 */
function throttle(delay, callback, options) {
  var _ref = options || {},
    _ref$noTrailing = _ref.noTrailing,
    noTrailing = _ref$noTrailing === void 0 ? false : _ref$noTrailing,
    _ref$noLeading = _ref.noLeading,
    noLeading = _ref$noLeading === void 0 ? false : _ref$noLeading,
    _ref$debounceMode = _ref.debounceMode,
    debounceMode = _ref$debounceMode === void 0 ? undefined : _ref$debounceMode;
  /*
   * After wrapper has stopped being called, this timeout ensures that
   * `callback` is executed at the proper times in `throttle` and `end`
   * debounce modes.
   */

  var timeoutID;
  var cancelled = false; // Keep track of the last time `callback` was executed.

  var lastExec = 0; // Function to clear existing timeout

  function clearExistingTimeout() {
    if (timeoutID) {
      clearTimeout(timeoutID);
    }
  } // Function to cancel next exec

  function cancel(options) {
    var _ref2 = options || {},
      _ref2$upcomingOnly = _ref2.upcomingOnly,
      upcomingOnly = _ref2$upcomingOnly === void 0 ? false : _ref2$upcomingOnly;
    clearExistingTimeout();
    cancelled = !upcomingOnly;
  }
  /*
   * The `wrapper` function encapsulates all of the throttling / debouncing
   * functionality and when executed will limit the rate at which `callback`
   * is executed.
   */

  function wrapper() {
    for (var _len = arguments.length, arguments_ = new Array(_len), _key = 0; _key < _len; _key++) {
      arguments_[_key] = arguments[_key];
    }
    var self = this;
    var elapsed = Date.now() - lastExec;
    if (cancelled) {
      return;
    } // Execute `callback` and update the `lastExec` timestamp.

    function exec() {
      lastExec = Date.now();
      callback.apply(self, arguments_);
    }
    /*
     * If `debounceMode` is true (at begin) this is used to clear the flag
     * to allow future `callback` executions.
     */

    function clear() {
      timeoutID = undefined;
    }
    if (!noLeading && debounceMode && !timeoutID) {
      /*
       * Since `wrapper` is being called for the first time and
       * `debounceMode` is true (at begin), execute `callback`
       * and noLeading != true.
       */
      exec();
    }
    clearExistingTimeout();
    if (debounceMode === undefined && elapsed > delay) {
      if (noLeading) {
        /*
         * In throttle mode with noLeading, if `delay` time has
         * been exceeded, update `lastExec` and schedule `callback`
         * to execute after `delay` ms.
         */
        lastExec = Date.now();
        if (!noTrailing) {
          timeoutID = setTimeout(debounceMode ? clear : exec, delay);
        }
      } else {
        /*
         * In throttle mode without noLeading, if `delay` time has been exceeded, execute
         * `callback`.
         */
        exec();
      }
    } else if (noTrailing !== true) {
      /*
       * In trailing throttle mode, since `delay` time has not been
       * exceeded, schedule `callback` to execute `delay` ms after most
       * recent execution.
       *
       * If `debounceMode` is true (at begin), schedule `clear` to execute
       * after `delay` ms.
       *
       * If `debounceMode` is false (at end), schedule `callback` to
       * execute after `delay` ms.
       */
      timeoutID = setTimeout(debounceMode ? clear : exec, debounceMode === undefined ? delay - elapsed : delay);
    }
  }
  wrapper.cancel = cancel; // Return the wrapper function.

  return wrapper;
}

class ImageCache {
  constructor(max = 100) {
    this.max = max || 200;
    this.caches = [];
  }
  has(key) {
    return this.caches.indexOf(key) !== -1;
  }
  add(key) {
    if (!this.has(key)) {
      this.caches.push(key);
      if (this.caches.length > this.max) {
        this.free();
      }
    }
  }
  free() {
    this.caches.shift();
  }
  empty() {
    this.caches = [];
  }
}

const loadImageAsync = (item, resolve, reject) => {
  let image = new Image();
  if (!item || !item.src) {
    const err = new Error('image src is required');
    return reject(err);
  }
  image.src = item.src;
  if (item.cors) {
    image.crossOrigin = item.cors;
  }
  image.onload = function () {
    resolve({
      naturalHeight: image.naturalHeight,
      naturalWidth: image.naturalWidth,
      src: image.src
    });
  };
  image.onerror = function (e) {
    reject(e);
  };
};

class RectiveListener {
  constructor(el, src) {
    this.state = {};
    this.initState();
    this.el = el;
    this.src = src;
    this._imageCache = new ImageCache(200);
  }
  initState() {
    this.state = {
      error: false,
      loading: true,
      loaded: false
    };
  }
  render() {}
  load() {
    if (this.state.loaded) return;
    // load Image
    if (this._imageCache.has(this.src)) {
      this.state.loaded = true;
      return;
    }
    loadImageAsync({
      src: this.src
    }, data => {
      this.naturalHeight = data.naturalHeight;
      this.naturalWidth = data.naturalWidth;
      this.state.loaded = true;
      this.state.error = false;
      this.state.rendered = true;
      this._imageCache.add(this.src);
      this.el.src = this.src;
    }, err => {
      !this.options.silent && console.error(err);
      this.state.error = true;
      this.state.loaded = false;
      this.render('error', false);
    });
  }
}

function Lazy(Vue) {
  return class Lazy {
    constructor(options) {
      this.options = options || {};
      this.version = '"1.0.0"';
      this.listenerQueue = [];
      this.initEvents();
      this.initIntersetionObserser();
      this.lazyLoadHandler = throttle(this._lazyLoadHandler.bind(this), this.options.throttleWait || 200);
    }
    _lazyLoadHandler() {}
    initIntersetionObserser() {
      this._observer = new IntersectionObserver(this._observerHandler.bind(this), {
        rootMargin: '0px',
        threshold: 0
      });
      if (this.listenerQueue.length) {
        this.listenerQueue.forEach(listener => {
          this._oberver.observe(listener.el);
        });
      }
    }
    _observerHandler(entries, observer) {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          // 加载
          this.listenerQueue.forEach(listener => {
            if (listener.el === entry.target) {
              console.log('entried');
              if (listener.state.loaded) return this._observer.unobserve(listener.el);
              listener.load();
            }
          });
        }
      });
    }
    initEvents() {
      this.Event = {
        listeners: []
      };
      this.$on = (event, fn) => {
        if (!this.Event.listeners[event]) this.Event.listeners[event] = [];
        this.Event.listeners[event].push(fn);
      };
      this.$off = (event, fn) => {
        if (!func) {
          if (!this.Event.listeners[event]) return;
          this.Event.listeners[event].length = 0;
          return;
        }
        const index = this.Event.listeners[event].indexOf(fn);
        if (index !== -1) {
          this.Event.listeners.splice(index, 1);
        }
      };
      this.$emit = (event, context) => {
        if (!this.Event.listeners[event]) return;
        this.Event.listeners[event].forEach(fn => {
          fn.apply(null, context);
        });
      };
      this.$once = (event, fn) => {
        const vm = this;
        function on() {
          vm.$off(event, fn);
          fn.apply(vm, arguments);
        }
        this.$on(event, on);
      };
    }
    add(el, binding, modifiers) {
      // init intersections
      Vue.nextTick(() => {
        console.log('add element');
        let src = binding.value;
        this._observer && this._observer.observe(el);
        // init state cache
        const reactiveListener = new RectiveListener(el, src);
        this.listenerQueue.push(reactiveListener);
      });
    }
    update(el) {}
    remove(el) {}
  };
}

var index = {
  install(Vue, options) {
    const isVue2 = Vue.version.split('.')[0] === '2';
    if (isVue2) {
      const LazyClass = Lazy(Vue);
      const lazy = new LazyClass(options);
      Vue.directive('lazy', {
        bind: lazy.add.bind(lazy),
        update: lazy.update.bind(lazy),
        unbind: lazy.remove.bind(lazy)
      });
    }
  }
};

export { index as default };
