// AST 语法树
{/* <div id="app" style="color: red">
  <span>{{arr.a}}</span>
</div> */}
// {
//   tag: 'div',
//   type: 1,           // nodeType
//   attrs: [{ style: "color: red" }],
//   children: [
//     { tag: 'span', type: 1, attrs: [], children: [], parent: null }
//   ],
//   parent: null
// }

const ncname = `[a-zA-Z_][\\-\\.0-9_a-zA-Z]*`             // aa
const qanameCapture = `((?:${ncname}\\:)?${ncname})`
const startTagOpen = new RegExp(`^<${qanameCapture}`)     // <div:aa>     // aa 标签的命名空间
const endTag = new RegExp(`^<\\/${qanameCapture}[^>]*>`)  // </div:aa>
{/* <div style="color: red"> */}
// 空格开头，后面不接受空格 " ' / = (^ 在 [] 内表示不接受 [] 中的字符匹配)
// ?: 表示匹配后面的但不获取结果
// 匹配这三种 style="xxx" | style='xxx' | style=xxx
const attribute = /^\s*([^\s"'<>\/=]+)(?:\s*(=)\s*(?:"([^"]*)"+|'([^']*)'+|([^\s"'=<>]+)))?/
const startTagClose = /^\s*(\/?)>/
export const defaultTagRE = /\{\{((?:.|\r?\n)+?)\}\}/g

// 解析 html，完成后删除
export function parseHTML(html) {
  // 创建 AST 语法树 (vue2 只支持一个根节点，vue3 支持多个，由于外层加了一个空元素)
  function createASTElement (tag, attrs) {
    return {
      tag,
      type: 1,
      children: [],
      attrs,
      parent: null
    }
  }

  // 根元素
  let root = null
  // 当前父元素 用于记录父子关系
  let curParent = null
  // 栈 管理所有节点
  const stack = []

  // 根据 开始 结束标签 文本内容 生成 AST 语法树
  function start (tagName, attrs) {
    let element = createASTElement(tagName, attrs)
    root = root || element
    curParent = element
    stack.push(element)
  }
  function end (tagName) {
    // 查找到结束标签则删除该标签，直至清空 stack
    // 并记录该标签的父节点
    // 保存到父节点的 children []
    let element = stack.pop()               // 移除并返回最后一个元素
    curParent = stack[stack.length - 1]
    if (curParent) {
      // 记录删除的元素的父节点
      element.parent = curParent
      curParent.children.push(element)
    }
  }
  function chars (text) {
    text = text.replace(/\s/g, '')
    if (text) {
      curParent.children.push({
        type: 3,                 // 文本 nodeType
        text
      })
    }
  }

  // 前进方法，解析完成一个，就删除
  function advance (n) {
    html = html.substring(n)
  }
  // 解析开始标签
  function parseStartTag () {
    const start = html.match(startTagOpen)
    if (start) {
      // 取得标签名
      let match = {
        tagName: start[1],
        attrs: []
      }
      advance(start[0].length)
      // 查找属性
      let end = null
      let attr = null
      while (!(end = html.match(startTagClose)) && (attr = html.match(attribute))) {
        advance(attr[0].length)
        match.attrs.push({
          name: attr[1],
          value: attr[3] || attr[4] || attr[5] || true
        })
      }
      if (end) {
        advance(end[0].length)
        return match
      }
    }
  }

  while (html){
    let textEnd = html.indexOf('<')
    if (textEnd === 0) {
      // 开始标签
      let startTagMatch = parseStartTag()
      if (startTagMatch) {
        // console.log('开始标签：' + startTagMatch.tagName)
        start(startTagMatch.tagName, startTagMatch.attrs)
        continue
      }
      // 结束标签
      let endTagMatch = html.match(endTag)
      if (endTagMatch) {
        advance(endTagMatch[0].length)
        // console.log('结束标签：' + endTagMatch[0])
        end(endTagMatch[0])
        continue
      }
    }
    let text = null
    if (textEnd > 0) {            // 开始解析文本 
      text = html.substring(0, textEnd)
    }
    if (text) {
      advance(text.length)
      chars(text)
    }
  }
  return root
}
