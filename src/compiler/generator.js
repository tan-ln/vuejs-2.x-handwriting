import { defaultTagRE } from "./parse"

// 迭代 属性
function genProps(attrs) {
  let str = ''
  for (let i = 0; i < attrs.length; i++) {
    const attr = attrs[i]
    // 属性为 style
    if (attr.name === 'style') {
      let obj = {}
      attr.value.split(';').forEach(item => {
        let [key, val] = item.split(':')
        obj[key] = val
      })
      attr.value = obj
    }
    // 其他属性直接拼接
    str += `${attr.name}:${JSON.stringify(attr.value)},`
  }
  return `{${str.slice(0, -1)}}`
}
// 迭代 子节点
function genChild(el) {
  const children = el.children
  if (children) {
    return children.map(child => gen(child)).join(',')
  }
}
// 区分是元素还是文本
function gen(node) {
  // 元素
  if (node.type == 1) {
    return generate(node)
  } else {
    // 文本
    // {{ attr }} | 普通文本 | 混合文本( {{aa}}bbb{{cc}} )
    let text = node.text
    // 是否带有 {{}}
    if (defaultTagRE.test(text)) {
      // 解析结果数组 takes
      let takes = []
      let match = null
      let index = 0
      let lastIndex = defaultTagRE.lastIndex = 0          // 重置 index，由于是全局匹配，if 已经匹配过一次
      // exec 返回一个匹配结果的数组 没有则返回 null
      while (match = defaultTagRE.exec(text)) {
        // 保存当前索引
        index = match.index
        // 
        if (index > lastIndex) {
          takes.push(JSON.stringify(text.slice(lastIndex, index)))
        }
        takes.push(`_s(${match[1].trim()})`)
        lastIndex = index + match[0].length
      }
      if (lastIndex < text.length) {
        takes.push(JSON.stringify(text.slice(lastIndex)))
      }

      return `_v(${takes.join('+')})`
    } else {
      return `_v(${JSON.stringify(text)})`
    }
  }
}

export default function generate(el) {
  let children = genChild(el)
  // _c 处理元素节点 
  let code = `_c('${el.tag}',${el.attrs.length ? genProps(el.attrs) : undefined}${children ? (',' + children) : ''})`
  // console.log(code)
  return code
}
