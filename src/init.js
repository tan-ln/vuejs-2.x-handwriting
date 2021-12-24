import { initState } from "./state"
import { compileToFunctions } from "./compiler/index"
import { mountComponent } from "./lifecycle"

// 初始化 Vue 实例
export function initMixin(Vue) {
  Vue.prototype._init = function (options) {
    // Vue 实例及属性
    const vm = this
    vm.$options = options
    // 初始化状态
    initState(vm)
    // initLifeCycle()
    // initEvents()

    // 有 el 表示可以挂载到页面
    if (vm.$options.el) {
      vm.$mount(vm.$options.el)
    }
  }
  Vue.prototype.$mount = function (el) {
    // #app 转化为 dom
    el = document.querySelector(el)
    const vm = this
    const options = vm.$options
    
    vm.$options.$el = el
  
    // 编译顺序：render -> template -> 外部模板(#app)
    if (!options.render) {
      let template = options.template
      if (!template && el) {
        template = el.outerHTML
      }
      // 将 模板 编译成 render 函数
      const render = compileToFunctions(template)
      options.render = render
    }

    // 组件挂载
    mountComponent(vm, el)
  }
}
