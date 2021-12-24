export function patch(oldVNode, vnode) {
  // oldVNode 是一个真实元素，DOM 操作 有 nodeType
  const isRealElement = oldVNode.nodeType
  // 是否是真实节点
  if (isRealElement) {
    // 是则初次渲染
    const oldEle = oldVNode       // id="app"
    const parentEle = oldEle.parentNode
    // 根据 vnode 创建真实 DOM
    let el = createEle(vnode)
    // 把创建出来的元素 插入到 原节点的后面，并且 删掉原节点，实现更新替换
    parentEle.insertBefore(el, oldEle.nextSibling)
    parentEle.removeChild(oldEle)

    return el     // vm.$el
  } else {
    // diff
  }
}

// 创建真实 DOM
function createEle(vnode) {
  let { vm, tag, data, key, children, text } = vnode

  if (typeof tag === 'string') {
    // 也有可能可能是组件，未考虑
    // 用 vue 指令时，可以通过 vnode 拿到真实 DOM
    vnode.el = document.createElement(tag)
    // 属性
    updateProperties(vnode)
    // 子节点 递归
    children.forEach(item => {
      vnode.el.appendChild(createEle(item))
    })
  } else {
    vnode.el = document.createTextNode(text)
  }

  return vnode.el
}

function updateProperties(vnode) {
  let newProps = vnode.data || {}
  let el = vnode.el
  // 遍历属性
  for (const key in newProps) {
    // 行内样式
    if (key === 'style') {
      for (const sty in newProps.style) {
        el.style[sty] = newProps.style[sty]
      }
    } else if (key === 'class') {
      el.className = newProps.class
    } else {
      el.setAttribute(key, newProps[key])      
    }
  }
}
