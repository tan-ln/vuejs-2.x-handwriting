// 获取 Array 原型上的 方法，但不可直接改写，只有被 vue 控制的数组需要改写
const oldArrayProtoMethods = Array.prototype

// 产生 arrayMethods.__proto__ = Array.prototype 效果
export const arrayMethods = Object.create(Array.prototype)
// 直接改变数组本身的方法
const  methods = [
  'push',
  'pop',
  'shift',
  'unshift',
  'reverse',
  'sort',
  'splice'
]

methods.forEach(item => {
  arrayMethods[item] = function(...args) {
    // 此时可获取数组变化
    console.log('array change')

    // 数组中新增的成员为 object 时，需要进行劫持
    let inserted = null                 // 新插入的值
    switch (item) {
      case 'push':
      case 'unshift':
        inserted = args
        break
      case 'splice':
        inserted = args.slice(2)
        break
    }
    if (inserted) {
      // this 是 Observer 类中调用 arrayMethods 的 value
      // __ob__ 是 Observer 类中保存的 this
      this.__ob__.observeArray(inserted)
    }

    let result = oldArrayProtoMethods[item].call(this, ...args)
    return result
  }
})
