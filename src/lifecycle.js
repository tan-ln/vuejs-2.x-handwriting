import Watcher from "./watcher"
import { patch } from "./vdom/patch"

export function lifecycleMixin(Vue) {
  // vnode -> DOM
  Vue.prototype._update = function(vnode) {
    const vm = this
    // console.log(vnode)
    // 首次渲染 用 vnode 去更新真实 DOM
    vm.$el = patch(vm.$options.$el, vnode)
  }
}

export function mountComponent(vm, el) {
  // vue 默认是通过 watcher 渲染的
  // 每一个 组件 都有一个 渲染 watcher

  const updateComponent = () => {
    // _render() 返回虚拟 DOM
    // _update() 将虚拟DOM转为 真实DOM
    vm._update(vm._render())
  }

  // 等价于直接调用 updateComponent() 方法执行，watcher 的作用就是 每 new 一次调用一遍传入的 fn()
  new Watcher(vm, updateComponent, () => {}, true)
}
