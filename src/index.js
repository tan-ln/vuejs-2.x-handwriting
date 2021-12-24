import { initMixin } from "./init"
import { renderMixin } from "./render"
import { lifecycleMixin } from "./lifecycle"

// Vue 在 2.x 版本中是 构造函数
function Vue(options) {
  this._init(options)
}

// Vue.prototype._init = function(options) {}
// 以原型 prototype 的方式扩展功能

// 初始化方法 抽离成文件
initMixin(Vue)
lifecycleMixin(Vue)           // 扩展 _update() <_update() 将虚拟 DOM 转 真实 DOM>
renderMixin(Vue)              // 扩展 _render() <_render() 返回虚拟 DOM>

export default Vue
