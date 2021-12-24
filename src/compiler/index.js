import { parseHTML } from "./parse"
import generate from "./generator"

export function compileToFunctions(template) {
  // 编译 hmtl，返回出一个 ast 对象
  let ast = parseHTML(template)
  // console.log(ast)
  // 将 AST 树转化为 code 字符串
  let code = generate(ast)

  // 用 with 包一层
  let render = `with(this){return ${code}}`

  // 字符串转成函数
  let fn = new Function(render)
  // console.log(fn)
  return fn
}
