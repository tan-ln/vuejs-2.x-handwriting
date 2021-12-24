import serve from 'rollup-plugin-serve'
import babel from 'rollup-plugin-babel'

// 打包配置
export default {
  input: './src/index.js',
  output: {
    file: 'dist/vue.js',
    name: 'Vue',                       // 全局名字
    format: 'umd',                     // 默认 window.Vue (支持 CommonJS 和 ES6 规范)
    sourcemap: true                    // 源码映射 es6 -> es5  
  },
  plugins: [
    babel({
      exclude: "node_modules/**",      // 不包含
      // presets                          // 也可 .babelrc
    }),
    serve({
      open: true,                       // 自动打开浏览器
      openPage: '/public/index.html',
      port: '3000',
      contentBase: ''                   // 从默认(当前的`/public/index.html`)内容文件启动
    })
  ]
}
