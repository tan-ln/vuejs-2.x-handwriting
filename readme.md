# vue

vue2 缺陷 tree-shaking 摇树
```js
// options API 对于 tree-shaking 感知不到
methods: {
  fn() {}     // 不用的方法不能筛选掉
}

```

`public/index.html` ---------- 入口文件
```js
// rollup.config.js
// 配置 rollup 打包类库(项目 webpack)

// package.json
"dev": "rollup -c -w"               // -c 使用配置文件 -w 变更时自动打包
```

- 构造函数 vue -> 初始化 initMixin/initState/initData


## 原理

```js
const vm = new Vue({
  el: '#app',
  data() {
    return {}
  },
  onMount() {},
  methods: {},
  computed: {},
  watch: {},
  template: `<div></div>`,
  render: () => {
    return h()
  }
})
```

1. Vue 构造函数
> Vue 在 2.x 版本中是**构造函数**的形式，3.x 中是 **class**
```js
function Vue (opitons) {
  this._init(options)
}
```
> Vue 是通过在*构造函数*的**原型**上，扩展功能来实现 Vue

2. 初始化
- `initState`
```js
// init.js
Vue.prototype._init = function(options) {
  const vm = this
  vm.$options = options
  // 初始化 state
  initState(vm)
}
```
- 初始化 `state`
```js
// state.js
export function initState(vm) {
  const opts = vm.$options
  // vue 有很多种数据 data | computed | watch | props | ...
  if (opts.data) {
    initData(vm)
  }
}
```
- 初始化 `data`
```js
function initData(vm) {
  observe(vm.$options.data)                   // new Observer(vm.$options.data)
}
```

3. 观测数据并做数据劫持
```js
// observer
class Observer {
  constructor () {
    // 判断数据类型是 对象还是 数组
    // Vue 对于数组不能像 对象一样对其每一项 成员进行劫持
    // 而且通过重新定义那些 Array 上可以改变数组本身的方法
    // 创建一个 中间对象用于继承 Array.prototype 的方法
    // 并在这个对象上重写
    // 再以原型链的形式 挂到 中间对象上实现代理
    // 数组变化时访问的就是 重写后的方法
  }
  walk(data) {
    // 对 data 对象的 key 进行遍历，并且将其设定为 响应式
    Object.keys(data).forEach(key => {
      defineReactive(data, key, data[key])
    })
  }
}
// 重写 get | set 附上响应式
export function defineReactive(data, key, value) {
  // 2 观测
  // 判断 data 对象的属性 是否是 object 类型
  // 是则 递归
  observe(value)

  Object.defineProperty(data, key, {
    get: () => {
      dep.depend()                // 收集依赖 watcher
      return value
    },
    set: (newVal) => {
      // 3 观测
      // 判断 新值 是否为 object ( vm.data = { name: '', age: 0 } 如对 data 重新赋值 )
      observe(newVal)
      if(newVal === value) return
      value = newVal
      dep.notify()                // 更新视图
    }
  })
}
```
4. 页面挂载
> 初始化时定义 $mount 方法，并判断是否 可以挂载到页面
```js
// init.js
Vue.prototype._init = function (options) {
  // 有 el 参数 表示可以挂载到页面
  if (vm.$options.el) {
    vm.$mount(vm.$options.el)
  }
}
Vue.prototype.$mount = function (el) {
  el = document.querySelector(el)
  // 编译顺序：先看 options 里面有没有 render -> template -> 外部模板(#app)
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
```
> compiler 编译模块，将 `template`(options 内的 template 参数和 外部 #app 模板) 编译成 `AST 语法树`，最后返回的就是 `render` 函数
```js
export function compileToFunctions(template) {
  // 编译 hmtl，返回出一个 ast 对象
  let ast = parseHTML(template)
  // console.log(ast)
  // 迭代器 将 AST 树转化为 code 字符串
  // 迭代 属性 和 子节点
  // 拼接成 _c _v _s 方法包裹的字符串
  let code = generate(ast)

  // 用 with 包一层，with 的作用是 改变 作用域
  let render = `with(this){return ${code}}`

  // 字符串转成函数
  let fn = new Function(render)
  return fn
}
```

5. 页面渲染
> `mountComponent()` 挂载组件时 调用` _render` 方法，将 `AST 树`转换为 `vnode`，再将 `vnode` 转换为 真实 `DOM` 挂载到页面

```js
// mountComponent
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
```

```js
// render.js
Vue.prototype._render = function () {
  let vnode = vm.$options.render.call(vm)
  return vnode
}
```
```js
Vue.prototype._update = function(vnode) {
  vm.$el = patch(vm.$options.$el, vnode)
  // patch 方法就是 DOM 操作，创建 真实 DOM，遍历属性，
  // 把创建出来的元素 插入到 原节点的后面，并且 删掉原节点，实现更新替换
}
```


## 总结
Vue2.x 的实现重点就是 **`Object.defineProperty` 数据劫持**、**虚拟 DOM** 、**diff 算法**

