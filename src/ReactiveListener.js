import ImageCache from './image-cache'
import { loadImageAsync } from './utils'
export default class RectiveListener {
  constructor(el, src){
    this.state = {}
    this.initState()
    this.el = el
    this.src = src
    this._imageCache = new ImageCache(200)
  }

  initState(){
    this.state = {
      error: false,
      loading: true,
      loaded: false
    }
  }

  render(type){
    console.log('type', type)
  }

  load(){
    if(this.state.loaded) return
    // load Image
    if(this._imageCache.has(this.src)){
      this.state.loaded = true
      return
    }
    loadImageAsync({ src: this.src}, data => {
      this.naturalHeight = data.naturalHeight
      this.naturalWidth = data.naturalWidth
      this.state.loaded = true
      this.state.error = false
      this.state.rendered = true
      this._imageCache.add(this.src)
      this.el.src = this.src
    }, err => {
      !this.options.silent && console.error(err)
      this.state.error = true
      this.state.loaded = false
      this.render('error', false)
    })
  }
}