# WordPress 主题风格网站开发样板 

> 为使前后端分离, 且数据由后端直接渲染到视图, 还要让前端开发流程能不依赖后端数据.

## 如何使用

- `npm install` 安装依赖后 `npm run start` 启动, 然后访问 https://localhost:8080
- `src/views` 里为视图, `src/assets/js/` 为脚本, 脚本文件目录结构应与视图的一致. 打包时对应的脚本将自动引入到视图里. 样式也是一样.
- `src/assets/vendor` 里为全局依赖, 由于引入有顺序要求, 所以需要手动配置到 `webpack.common.js` 里.

## 注意事项

- 使用 Webpack 将 `src` 目录里的 视图/脚本/样式 打包编译到 `dist` 发布目录. 生产环境编译时可将视图与静态资源打包到不同目录.
- 视图使用 [handlebarsjs](https://handlebarsjs.com/) 模版, 增加了 `layout` 风格 `partial`.
- 默认引入了 Vue 处理复杂交互场景.

## 其它

- 修改 Webpack 配置时请悉知每项改动造成的影响.
- 尽量不要将较大的第三方依赖引入页面 js, 若多页面使用, 直接配置到全局依赖里.


## TODO
- 避免每次改动都触发 `src/assets/vendor` 里的文件复制动作.
