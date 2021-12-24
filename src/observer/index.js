import { arrayMethods } from "./array"

class Observer {
  // 需要对 value 重新定义
  constructor(value) {
    // 保存 this 用于调用 方法
    // value.__ob__ = this          // 不能直接保存 this，否则会成为 value 对象的一个属性 也是对象 造成无限循环
    Object.defineProperty(value, '__ob__', {
      value: this,
      enumerable: false,               // 不可枚举，则不会循环
      configurable: false              // 不可删除
    })
    // 这样 __ob__ 就可以成为一个 observe 过的属性的标识

    // vue2 中没有对数组每一项进行 defineProperty 劫持，如果 下标 过多性能消耗很大
    if(Array.isArray(value)) {
      // 通过重写常用的 数组方法 push | shift | reserve | sort .. 来增加更新逻辑
      // 从 Array 继承的 7 个方法，挂到 value 对象的 __proto__ 上，成为 value 本身的方法 并重写
      // 其他不改变数组本身的方法将直接从 Array 获取
      // value.__proto__ = arrayMethods
      Object.setPrototypeOf(value, arrayMethods)
      // 观测数组的每一项
      // 目的是判断数组成员是否为 object
      this.observeArray(value)              // 处理原有数组中的 object
    } else {
      // value 是 object
      this.walk(value)
    }
  }

  observeArray(value) {
    for(let i = 0; i < value.length; i++) {
      observe(value[i])
    }
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
    get: () => value,
    set: (newVal) => {
      // 3 观测
      // 判断 新值 是否为 object ( vm.data = { name: '', age: 0 } 如对 data 重新赋值 )
      observe(newVal)
      if(newVal === value) return
        value = newVal
      }
  })
}

export function observe(data) {
  // 只对对象类型进行观测
  if (typeof data !== 'object' || data == null) return
  // __ob__ 标识 表示被 observe 过，可以防止无限循环
  if (data.__ob__) return
  // 通过class 对数据进行观测，每个都是唯一的实例
  return new Observer(data)
}