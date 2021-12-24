let id = 0

export default class Watcher {
  constructor (vm, fn, cb, options) {
    this.vm = vm
    this.fn = fn
    this.cb = cb
    this.options = options
    this.id = id++
    // 调用传入的函数
    this.fn()
  }
}
