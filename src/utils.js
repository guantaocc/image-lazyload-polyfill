const loadImageAsync = (item, resolve, reject) => {
  let image = new Image()
  if (!item || !item.src) {
    const err = new Error('image src is required')
    return reject(err)
  }

  image.src = item.src
  if (item.cors) {
    image.crossOrigin = item.cors
  }

  image.onload = function () {
    resolve({
      naturalHeight: image.naturalHeight,
      naturalWidth: image.naturalWidth,
      src: image.src
    })
  }

  image.onerror = function (e) {
    reject(e)
  }
}

export {
  loadImageAsync
}