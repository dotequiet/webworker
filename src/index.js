import Workers from 'worker-loader!./components/workercanvas.js';

class InitCanvas {
  constructor() {
    this.canvas = null
    this.worker = null
    this.offscreen = null
    this.createCanvas()
  }
  createCanvas() {
    if (document.querySelector('#canvas')) {
      this.canvas = document.querySelector('#canvas')
    } else {
      this.canvas = document.createElement( 'canvas' )
      this.canvas.id = 'canvas'
      document.querySelector('#canvasApp').appendChild( this.canvas )
    }
    this.canvas.width = window.innerWidth
    this.canvas.height = window.innerHeight
    // 开启canvas离屏渲染
    this.offscreen = this.canvas.transferControlToOffscreen()
    // 开启worker子进程
    this.worker = new Workers()
    this.onWorkeMessage()
  }
  onWorkeMessage(cb = () => {}) {
    // 接收worker内回调
    this.worker.onmessage = ({data}) => {
      if ( typeof cb === 'function') {
        cb(data)
      } else {
        throw Error('callback is not function')
      }
    }
  }
  workerPostMessage(data = {}) {
    // worker传输数据
    this.worker.postMessage(data, [this.offscreen])
  }
}

const drawCanvas = new InitCanvas()
let config = {
  cw: window.innerWidth,
  ch: window.innerHeight,
}
fetch('./json/data.json', { credentials: 'include' })
  .then(res => res.json())
  .then(data => {
    if (data.ec === 200) {
      drawCanvas.workerPostMessage({data: data.data, w: config.cw, h: config.ch, c: drawCanvas.offscreen}, [drawCanvas.offscreen])
    }
  })
  .catch(e => {
    console.log(e)
  })

