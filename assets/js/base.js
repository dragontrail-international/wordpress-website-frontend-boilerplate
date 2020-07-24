import { fromEvent } from 'rxjs'
import { debounceTime, filter, map, share, startWith, tap } from 'rxjs/operators'

let mobileViewInit = false
let desktopViewInit = false

// mobile/desktop 端断点
const breakpoint = Number($('meta[name="breakpoint"]').attr('content'))

const windowResize$ = fromEvent(window, 'resize').pipe(
  map(() => window.innerWidth),
  debounceTime(500),
  share(),
  startWith(window.innerWidth),
)

// mobile 视图窗口准备好了
window.mobileView$ = windowResize$.pipe(
  filter(() => !mobileViewInit),
  filter((width) => width < breakpoint),
  tap(() => {

    // 在下一个事件循环中标记完成
    setTimeout(() => {
      // console.log('init mobile view')
      mobileViewInit = true
    })
  }),
)

// desktop 视图窗口准备好了
window.desktopView$ = windowResize$.pipe(
  filter(() => !desktopViewInit),
  filter((width) => width >= breakpoint),
  tap(() => {

    // 在下一个事件循环中标记完成
    setTimeout(() => {
      // console.log('init desktop view')
      desktopViewInit = true
    })
  }),
)


// 神奇的斗篷 cloak, 防止 FOUC
setTimeout(function () {
  $('.cloak').removeClass('cloak')
}, 1) // 不要设置为 0, iOS 某些版本不支持
