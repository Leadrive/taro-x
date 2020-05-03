import Taro from '@tarojs/taro'
import { execObject, SelectorQuery } from '@tarojs/taro/types/index'

const ENV = Taro.getEnv()

function delay (delayTime = 500): Promise<null> {
  return new Promise(resolve => {
    if ([Taro.ENV_TYPE.WEB, Taro.ENV_TYPE.SWAN].includes(ENV)) {
      setTimeout(() => {
        resolve()
      }, delayTime)
      return
    }
    resolve()
  })
}

function delayQuerySelector (
  self,
  selectorStr: string,
  delayTime = 500
): Promise<Array<execObject>> {
  const $scope = ENV === Taro.ENV_TYPE.WEB ? self : self.$scope
  const selector: SelectorQuery = Taro.createSelectorQuery().in($scope)

  return new Promise(resolve => {
    delay(delayTime).then(() => {
      selector
        .select(selectorStr)
        .boundingClientRect()
        .exec((res: Array<execObject>) => {
          resolve(res)
        })
    })
  })
}

function delayGetScrollOffset ({ delayTime = 500 }): Promise<Array<execObject>> {
  return new Promise(resolve => {
    delay(delayTime).then(() => {
      Taro.createSelectorQuery()
        .selectViewport()
        .scrollOffset()
        .exec((res: Array<execObject>) => {
          resolve(res)
        })
    })
  })
}

function delayGetClientRect ({
  self,
  selectorStr,
  delayTime = 500
}): Promise<Array<execObject>> {
  const $scope =
    ENV === Taro.ENV_TYPE.WEB || ENV === Taro.ENV_TYPE.SWAN ? self : self.$scope
  const selector: SelectorQuery = Taro.createSelectorQuery().in($scope)

  return new Promise(resolve => {
    delay(delayTime).then(() => {
      selector
        .select(selectorStr)
        .boundingClientRect()
        .exec((res: Array<execObject>) => {
          resolve(res)
        })
    })
  })
}

function uuid (len = 8, radix = 16): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz'.split('')
  const value: string[] = []
  let i = 0
  radix = radix || chars.length

  if (len) {
    // Compact form
    for (i = 0; i < len; i++) value[i] = chars[0 | (Math.random() * radix)]
  } else {
    // rfc4122, version 4 form
    let r

    // rfc4122 requires these characters
    /* eslint-disable-next-line */
    value[8] = value[13] = value[18] = value[23] = '-'
    value[14] = '4'

    // Fill in random data.  At i==19 set the high bits of clock sequence as
    // per rfc4122, sec. 4.1.5
    for (i = 0; i < 36; i++) {
      if (!value[i]) {
        r = 0 | (Math.random() * 16)
        value[i] = chars[i === 19 ? (r & 0x3) | 0x8 : r]
      }
    }
  }

  return value.join('')
}

interface EventDetail {
  pageX: number
  pageY: number
  clientX: number
  clientY: number
  offsetX: number
  offsetY: number
  x: number
  y: number
}

function getEventDetail (event: any) {
  let detail: EventDetail
  switch (ENV) {
    case Taro.ENV_TYPE.WEB:
      detail = {
        pageX: event.pageX,
        pageY: event.pageY,
        clientX: event.clientX,
        clientY: event.clientY,
        offsetX: event.offsetX,
        offsetY: event.offsetY,
        x: event.x,
        y: event.y
      }
      break

    case Taro.ENV_TYPE.WEAPP:
      detail = {
        pageX: event.touches[0].pageX,
        pageY: event.touches[0].pageY,
        clientX: event.touches[0].clientX,
        clientY: event.touches[0].clientY,
        offsetX: event.target.offsetLeft,
        offsetY: event.target.offsetTop,
        x: event.target.x,
        y: event.target.y
      }
      break

    case Taro.ENV_TYPE.ALIPAY:
      detail = {
        pageX: event.target.pageX,
        pageY: event.target.pageY,
        clientX: event.target.clientX,
        clientY: event.target.clientY,
        offsetX: event.target.offsetLeft,
        offsetY: event.target.offsetTop,
        x: event.target.x,
        y: event.target.y
      }
      break

    case Taro.ENV_TYPE.SWAN:
      detail = {
        pageX: event.changedTouches[0].pageX,
        pageY: event.changedTouches[0].pageY,
        clientX: event.target.clientX,
        clientY: event.target.clientY,
        offsetX: event.target.offsetLeft,
        offsetY: event.target.offsetTop,
        x: event.detail.x,
        y: event.detail.y
      }
      break

    default:
      detail = {
        pageX: 0,
        pageY: 0,
        clientX: 0,
        clientY: 0,
        offsetX: 0,
        offsetY: 0,
        x: 0,
        y: 0
      }
      console.warn('getEventDetail暂未支持该环境')
      break
  }
  return detail
}

function initTestEnv () {
  if (process.env.NODE_ENV === 'test') {
    Taro.initPxTransform({ designWidth: 750 })
  }
}

function isTest () {
  return process.env.NODE_ENV === 'test'
}

let scrollTop = 0

/**
 *获取scrollTop的值，兼容所有浏览器 
 */
function getScrollTop() {
	var scrollTop = document.documentElement.scrollTop || document.body.scrollTop;
	return scrollTop;
}
 
/**
 *设置scrollTop的值，兼容所有浏览器 
 */
function setScrollTop(scroll_top) {
	document.documentElement.scrollTop = scroll_top;
	document.body.scrollTop = scroll_top;
}

function handleTouchScroll (flag) {
  if (ENV !== Taro.ENV_TYPE.WEB) {
    return
  }
  if (flag) {
    // 兼容性处理各个浏览器的滚动高度的获取，各个浏览器在使用的时候会支持下面两个值中的一个，让另一个始终为0
    scrollTop = getScrollTop()
    // 使body脱离文档流
    document.body.classList.add('at-frozen')

    // 把脱离文档流的body拉上去！否则页面会回到顶部！
    document.body.style.top = `${-scrollTop}px`
  } else {
    document.body.style.top = null
    document.body.classList.remove('at-frozen')
    // window.scrollTo(0, scrollTop)
    // 兼容性处理各个浏览器的滚动设置方案， 其中有document.body.scrollTop的方式设置以及获取滚动条高度
    setScrollTop(scrollTop)
  }
}

function pxTransform (size) {
  if (!size) return ''
  return Taro.pxTransform(size)
}

/**
 * 
 * @param date 日期
 * @param step 0,1,2 上月，本月，下月
 */
const getDateDay = (date, step = 1) => {
    const targetDate = new Date(date)
    targetDate.setMonth(targetDate.getMonth() + step)
    targetDate.setDate(0)
    return targetDate.getDate()
}

const getWeekday = (sDate) =>{
    console.log(sDate)
    var dt = new Date(sDate);
    // var a = ['星期日', '星期一','星期二','星期三','星期四','星期五','星期六'];
    return dt.getDay()
}

export {
  delay,
  delayQuerySelector,
  uuid,
  getEventDetail,
  initTestEnv,
  isTest,
  pxTransform,
  handleTouchScroll,
  delayGetClientRect,
  delayGetScrollOffset,
  getDateDay,
  getWeekday
}
