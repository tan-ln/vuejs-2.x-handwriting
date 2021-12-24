import { observe } from "./observer/index"

// 初始化状态
export function initState(vm) {
  // 将所有数据都定义在 vm
  // 并且后续更改需要触发视图更新
  const opts = vm.$options
  // 数据初始化
  // vue 有很多种数据 data | computed | watch | props | ...
  if (opts.data) {
    initData(vm)
  }
}

// 代理 直接通过 vm 获取 data 上的数据
function proxy(vm, source, key) {
  Object.defineProperty(vm, key, {
    get: () => {
      return vm[source][key]
    },
    set: (newVal) => {
      vm[source][key] = newVal
    }
  })
}

// 数据初始化
function initData(vm) {
  // 进行数据劫持
  let data = vm.$options.data
  // 对 data 类型进行判断，函数则返回其 返回值 作为对象
  data = typeof data === 'function' ? data.call(vm) : data
  // 作为私有属性暴露出去，用于获取劫持后的数据
  vm._data = data
  // 将 _data 代理到 vm 上(直接 vm.age ...)
  for (const key in data) {
    proxy(vm, '_data', key)                      // vm.age ==> vm._data.age
  }
  // 1 观测 data
  observe(data)
}
