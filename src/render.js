import { createElement, createTextVNode } from "./vdom/index.js"

export function renderMixin(Vue) {
  // 元素 vnode
  Vue.prototype._c = function (...args) {
    return createElement(this, ...args)
  }
  // 文本 vnode
  Vue.prototype._v = function (text) {
    return createTextVNode(this, text)
  }
  // 转换成 字符串
  Vue.prototype._s = function (val) {
    return val === null ? '' : (typeof val === 'object') ? JSON.stringify(val) : val
  }

  Vue.prototype._render = function () {
    // console.log('_render')
    const vm = this
    // 编译后的 render 方法
    let render = vm.$options.render
    // render() 产生虚拟节点
    let vnode = render.call(vm)

    return vnode
  }
}
