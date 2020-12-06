 /* eslint-disable */
 self.requestAnimFrame= function(){return self.requestAnimationFrame||self.webkitRequestAnimationFrame||self.mozRequestAnimationFrame||function(a){self.setTimeout(a,1E3/60)}}()
class FlyLine {
  constructor(data) {
    this.data = data.data
    this.cw = data.w
    this.ch = data.h
    this.flys = []
    this.flysPath = []
    this.cacheCanvas = data.c
    this.context = null
    this.positionX = 0
    this.positionY = 0
    this.distanceY = 50
    this.ports = []
    this.planes = []
    this.$ = {}
    this.opt = {}
    this.et = 0
    this.flySwitch = false
    this.bigServiceList = [
      {
        w: 150,
        h: 150,
        positionX: 100,
        positionY: 0
      }, {
        w: 200,
        h: 200,
        positionX: 800,
        positionY: 150
      }, {
        w: 150,
        h: 150,
        positionX: 200,
        positionY: 400
      }, {
        w: 250,
        h: 250,
        positionX: this.calculateLastPos(this.cw),
        positionY: this.calculateLastPos(this.ch)
      }
    ]
    this.bigServicePos = 1
  }
  calculateLastPos(length) {
    return length === this.cw ? Math.floor((length - 300) / 50) * 50 - 100 : Math.floor((length - 300) / 50) * 50 + 50
  }
  setCanvas() {
    this.context = this.cacheCanvas.getContext( '2d' )
    this.context.textAlign = 'center'
    this.context.textBaseline = 'middle'
    this.context.font = '10px monospace'
    this.render()
  }
  clamp( val, min, max ) {
    return Math.min( Math.max( val, Math.min( min, max ) ), Math.max( min, max ) );
  }
  renderFly() {
    if (this.flySwitch) {
      if(this.context){
        this.context.clearRect(0, 0, this.cacheCanvas.width, this.cacheCanvas.height)
        this.positionX = 0
        this.positionY = 0
        let i = 0
        while( i < this.ports.length ) {
          this.port(this.ports[ i ])
          i++
        }
      }
      this.drawFly()
      if (this.flys.length) {
        requestAnimationFrame(this.renderFly.bind(this))
      }
    }
  }
  drawFly(){
    for(let i = 0, len = this.flys.length; i < len; i++){
      let flysItem = this.flys[i]
      this.drawQ(flysItem)
    }
  }
  drawQ(f){
    let p1,p2
    if(f.t1 < 1){
      f.t1 += f.step
      f.t1 = Math.min(1,f.t1)
    }
    if(f.t1 >= f.l){
      f.t2 += f.step
      f.t2 = Math.min(1,f.t2)
    }
    if (f.t1 > Math.random() * 100) {
      f.t1 = 0
      f.t2 = 0
    }
    this.context.save()
    this.context.beginPath()
    this.context.translate(f.s.x, f.s.y)
    this.context.rotate(f.r)
    this.context.moveTo(0, 0)
    // 绘制赛贝尔曲线
    this.context.quadraticCurveTo(f.ctl.x, f.ctl.y, f.dis, 0)
    this.context.strokeStyle = f.strokeStyle
    this.context.lineWidth = f.size
    this.context.stroke()
    let grd = ''
    try {
      p1 = this.getPointQuadRaticBeizer({ x: 0, y: 0 }, f.ctl, { x: f.dis, y: 0 }, f.t1)
      p2 = this.getPointQuadRaticBeizer({ x: 0, y: 0 }, f.ctl, { x: f.dis, y: 0 }, f.t2)
      grd = this.context.createLinearGradient(p2.x, p2.y,p1.x, p1.y)
    } catch (error) {
      debugger
    }
    grd.addColorStop(0, 'rgba(255,255,255, 0)')
    grd.addColorStop(1, 'rgba(7, 120, 249, 0.3)')
    grd.addColorStop(1, 'rgba(255,255,255,0)')
    this.context.quadraticCurveTo(f.ctl.x, f.ctl.y, f.dis, 0)
    this.context.strokeStyle = grd
    this.context.lineWidth = f.size
    this.context.stroke()
    this.context.restore()
  }
  getPointInLine (s, e, t) {
    let x = e.x - (e.x - s.x) * t
    let y = e.y - (e.y - s.y) * t
    return { x: x, y: y}
  }
  getPointQuadRaticBeizer (s, c, e, t) {
    let x = Math.pow(1 - t, 2) * s.x + 2 * (1 - t) * t * c.x + Math.pow(t, 2) * e.x
    let y = Math.pow(1 - t, 2) * s.y + 2 * (1 - t) * t * c.y + Math.pow(t, 2) * e.y
    return { x: x, y: y }
  }
  // 获取两点之间距离
  getDis (p1, p2) {
    return  Math.sqrt(Math.pow((p1.x - p2.x), 2) + Math.pow(((p1.y - p2.y)), 2))
  }
  //
  getRotate (f) {
    let r
    let s = f.s
    let e = f.e
    let _dis = f.dis
    if (e.x > s.x) {
      if (e.y > s.y) {
        r = Math.asin((e.y - s.y) / _dis)
      } else {
        r = Math.asin((s.y - e.y) / _dis)
        r = -r
      }
    } else {
      if (e.y > s.y) {
        r = Math.asin((e.y - s.y) / _dis)
        r = Math.PI - r
      } else {
        r = Math.asin((s.y - e.y) / _dis)
        r -= Math.PI
      }
    }
    return r
  }
  // 计算每块宽度
  calculateWidth(w) {
    let calculateW = this.positionX + w
    let fourPosY = this.calculateLastPos(this.ch)
    let fourPosX = this.calculateLastPos(this.cw)
    let oneModelCondition = !!(this.positionY === 0 || this.positionY === 50 || this.positionY === 100)
    let twoModelCondition = !!(this.positionY === 150 || this.positionY === 200 || this.positionY === 250  || this.positionY === 300)
    let threeModelCondition = !!(this.positionY === 400 || this.positionY === 450 || this.positionY === 500)
    let fourModelCondition = !!(this.positionY === fourPosY || this.positionY === (fourPosY + 50) || this.positionY === (fourPosY + 100) || this.positionY === (fourPosY + 150) || this.positionY === (fourPosY + 200))
    // 设置第一个大服务位置
    if (oneModelCondition && this.positionX === 0) {
      if (w < 50) {
        return 50
      } else {
        return 100
      }
    } else if (oneModelCondition && this.positionX < 100 ) {
      return 50
    }
    // 设置第二个大服务位置
    if (twoModelCondition && calculateW > 750 && this.positionX < 800) {
      return 800 - this.positionX
    }
    // 设置第三个大服务位置
    if (threeModelCondition && calculateW > 150 && this.positionX < 200) {
      return 200 - this.positionX
    }
    // 设置第四个大服务位置
    if (fourModelCondition && calculateW > (fourPosX - 50) && (this.positionX > this.cw / 2) && this.positionX < fourPosX) {
      return fourPosX - this.positionX
    }
    // 其他位置
    if (calculateW > this.cw) {
      return this.cw - this.positionX
    }
    return w
  }
  // 计算位置
  calculatePos(w) {
    let calculateW = this.positionX + w
    let fourPosY = this.calculateLastPos(this.ch)
    let fourPosX = this.calculateLastPos(this.cw)
    let oneModelCondition = !!(this.positionY === 0 || this.positionY === 50 || this.positionY === 100)
    let twoModelCondition = !!(this.positionY === 150 || this.positionY === 200 || this.positionY === 250 || this.positionY === 300)
    let threeModelCondition = !!(this.positionY === 400 || this.positionY === 450 || this.positionY === 500)
    let fourModelCondition = !!(this.positionY === fourPosY || this.positionY === (fourPosY + 50) || this.positionY === (fourPosY + 100) || this.positionY === (fourPosY + 150) || this.positionY === (fourPosY + 200))
    // 设置第一个大服务位置
    if (oneModelCondition && this.positionX === 0 && w > 50) {
      this.positionX += 250
      return false
    }
    if (oneModelCondition && this.positionX === 50) {
      this.positionX += 200
      return false
    }
    // 设置第二个大服务位置
    if (twoModelCondition && calculateW === 800) {
      this.positionX += (200 + w)
      return false
    }
    if (twoModelCondition && calculateW > 800 && calculateW < 1000 ) {
      this.positionX = 1000
      return false
    }
    // 设置第三个大服务位置
    if (threeModelCondition && calculateW === 200) {
      this.positionX += (150 + w)
      return false
    }
    if (threeModelCondition && calculateW > 200 && calculateW < 350 ) {
      this.positionX = 350
      return false
    }
    // 设置第四个大服务位置
    if (fourModelCondition && calculateW === fourPosX) {
      this.positionX += (250 + w)
      return false
    }
    if (fourModelCondition && calculateW > fourPosX && calculateW < (fourPosX + 250)) {
      this.positionX = (fourPosX + 250)
      return false
    }
    // 其他服务
    if (calculateW >= this.cw) {
      this.positionX = 0
      this.positionY += this.distanceY
    } else {
      this.positionX += w
    }
  }
  render(){
    // 服务个数
    this.opt.portCount = this.data.nodes.length
    // 服务关系总数
    this.opt.planeCount = this.data.links.length
    this.ports.length = 0
    this.planes.length = 0
    let i = 0
    let j = 0
    while(i < this.opt.portCount) {
      if (this.data.nodes[i].big) {
        this.data.nodes[i].bigIdx = this.bigServicePos++
      }
      let datas = this.port(this.data.nodes[i])
      if (datas) {
        this.ports.push(datas)
        i++
      }
    }
    while(j < this.opt.planeCount) {
      this.planes.push(this.plane(this.data.links[j]))
      j++
    }
    this.repeatDrawFlyLine()
  }
  repeatDrawFlyLine() {
    this.flys.length = 0
    let i = this.planes.length
    while( i-- ) {
      let _this = this.planes[ i ]
      let f = {}
      try {
        f = {
          type:'quad',
          o: {
            x: _this.source.cx,
            y: _this.source.cy
          },
          // 开始点
          s: {
            x: _this.source.cx,
            y: _this.source.cy
          },
          // 结束点
          e: {
            x: _this.target.cx,
            y: _this.target.cy
          },
          // 飞线颜色
          c: '#'+('00000'+(Math.random()*0x1000000<<0).toString(16)).substr(-6) || '#000',
          // 飞线时间
          t: 1500,
          // 飞线长度
          l:  0.5,
          t1: 0,
          t2: 0,
          // 飞线宽度
          size: _this.line * 2 - 1 || 1,
          // 弯曲程度
          i: 0.2,
          strokeStyle: 'rgba(255, 255, 255, 0.2)'
        }
        f.step = ((1 + f.l) * 1000) / (60 * f.t)
        f.dis = this.getDis(f.s,f.e)
        f.r = this.getRotate(f)
        f.ctl = {
          x: f.dis / 2,
          y: f.dis * f.i
        }
        this.flys.push(f)
      } catch (error) {
        console.log('position:', i)
        console.log('item:', _this)
        console.log(error)
      }
    }
    this.flySwitch = true
    this.renderFly()
  }
  port(data={}) {
    let _this = JSON.parse(JSON.stringify(data))
    let grd = this.context.createLinearGradient(this.positionX, this.positionY, this.positionX, this.positionY + this.distanceY)
    try {
      grd.addColorStop(0, _this.color1)
      grd.addColorStop(0.8, _this.color2)
    } catch (error) {
    }
    this.context.beginPath()
    let radom = Math.random()
    radom = radom.toFixed('2')
    radom = Math.abs(1 - radom)
    if (radom > 1) {
      radom = Number('0.' + radom.toString().split('.')[1])
    } else if (radom < 0.4) {
      radom = 0.5
    }
    if (_this.big) {
      let bigItem = {}
      if(_this.bigIdx > 4) return false
      if (_this.bigIdx) {
        bigItem = this.bigServiceList[_this.bigIdx - 1]
      }
      if(_this.error) {
        this.context.fillStyle = 'rgba(255, 0, 0,'+ radom + ')'
      } else {
        this.context.fillStyle = grd
      }
      this.context.fillRect(bigItem.positionX, bigItem.positionY, bigItem.w, bigItem.h)
      this.context.fill()
      this.context.fillStyle = '#000'
      this.context.fillText(`${_this.name}`, bigItem.positionX + bigItem.w / 2, bigItem.positionY + 15 )
      this.context.fillStyle = '#000'
      this.context.fillText(`(${_this.trueReq})`, bigItem.positionX + bigItem.w / 2, bigItem.positionY + 30 )
      _this.w = bigItem.w
      _this.h = bigItem.h
      _this.x = bigItem.positionX
      _this.y = bigItem.positionY
      _this.ox = bigItem.positionX
      _this.oy = bigItem.positionY
      _this.cx = bigItem.positionX + bigItem.w / 2
      _this.cy = bigItem.positionY + bigItem.h / 2
    } else {
      let rectW = 10 + 2 * _this.reqCount < this.distanceY ? this.distanceY : 10 + 2 * _this.reqCount > 200 ? 200 : 10 + 2 * _this.reqCount
      let calculateW = this.calculateWidth(rectW)
      if(_this.error) {
        this.context.fillStyle = 'rgba(255, 0, 0,'+ radom + ')'
      } else {
        this.context.fillStyle = grd
      }
      this.context.fillRect(this.positionX, this.positionY, calculateW, this.distanceY)
      this.context.fill()
      this.context.fillStyle = '#000'
      if (calculateW >= 100) {
        this.context.fillText(`${_this.name}`, this.positionX + ( calculateW / 2), this.positionY + 15 )
        this.context.fillStyle = '#000'
        this.context.fillText(`(${_this.trueReq})`, this.positionX + (calculateW / 2), this.positionY + 30 )
      }
      _this.w = calculateW
      _this.h = this.distanceY
      _this.x = this.positionX
      _this.y = this.positionY
      _this.ox = this.positionX
      _this.oy = this.positionY
      _this.cx = this.positionX + calculateW / 2
      _this.cy = this.positionY + this.distanceY / 2
      this.calculatePos(rectW)
    }
    return _this
  }
  getItem(data, axios) {
    let _this = JSON.parse(JSON.stringify(data))
    this.context.beginPath()
    this.context.rect(_this.ox, _this.oy, _this.w, _this.h)
    return this.context.isPointInPath(axios.x, axios.y)
  }
  plane(data={}) {
    let _this = {}
    _this.target = this.ports[data.target - 1]
    _this.source = this.ports[data.source - 1]
    _this.accel = 0.01
    _this.line = data.line
    return _this
  }
  calculateClickRect(data) {
    return this.ports.filter(item => this.getItem(item, data))
  }
}
let flyClass = null
addEventListener('message',(c) => {
  if (c.data.type) {
    let data = flyClass.calculateClickRect(c.data.e)
    self.postMessage({data: data[0], type: 'turnPage'})
  } else {
    if(flyClass) {
      flyClass.data = c.data.data
      flyClass.flySwitch = false
      flyClass.bigServicePos = 1
      flyClass.positionX = 0
      flyClass.positionY = 0
      setTimeout(() => {
        flyClass.render(1)
      }, 0)
    } else{
      flyClass = new FlyLine(c.data)
      flyClass.setCanvas()
    }
  }
}, false);
