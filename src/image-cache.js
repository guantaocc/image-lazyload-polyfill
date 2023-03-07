export default class ImageCache {
  constructor(max = 100){
    this.max = max || 200
    this.caches = []
  }
  has(key){
    return this.caches.indexOf(key) !== -1  
  }
  add(key){
    if(!this.has(key)){
      this.caches.push(key)
      if(this.caches.length > this.max){
        this.free()
      }
    }
  }
  free(){
    this.caches.shift()
  }
  empty(){
    this.caches = []
  }
}