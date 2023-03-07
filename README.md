# WordPress 主题风格网站开发样板

## 此项目不推荐使用, 推荐使用 Next.js/Nuxt.js 框架来完成服务端渲染. Wordpress 后端继续保持 API 输出数据方式.

> 为使前后端分离, 且数据由后端直接渲染到视图, 还要让前端开发流程能不依赖后端数据.

## 目录结构

```plain
.
├── README.md
├── assets/
├── dist/
├── jsconfig.json
├── layouts/
├── node_modules
├── nodemon.json
├── package.json
├── pages/
├── partials/
├── static/
├── webpack.common.js
├── webpack.dev.js
├── webpack.prod.js
└── yarn.lock
```

- `pages` 里为每个页面存放的目录, 每个页面自己的脚本样式图片都在页面自己的目录里, 不要在页面目录里再嵌套页面目录. 新加页面时 复制 `pages/template` 使用.
- `assets` 里为全局脚本、样式与图片.
- `layouts` 与 `partials` 里为视图的 layout 和 partial, 顾名思义.
- `static` 里为全局依赖的静态资源, 不需要加入编译流程的第三方依赖, 还有 favicon 都在这里.

## 如何使用

- `yarn install` 安装依赖.
- `npm run watch -- page=test` 编译单页, `npm run watch` 编译整个项目. 然后访问 [https://localhost:8080/test.html](https://localhost:8080/test.html), 则访问的是 `pages/test/test.hbs` 视图.
- `npm run watch` 编译整个项目.

## 注意事项

- 为保证需求变更时不那么痛苦, 尽量不写全局代码, 使代码尽可能地松耦合, 尽量互不影响.
- 为保证依赖安装速度, 使用 [Yarn](https://yarnpkg.com) 管理依赖.
- 为保证开发时的编译速度, 尽量一次专注编译一个视图.
- 使用了 [Webpack](https://webpack.js.org) 打包编译到 `dist` 发布目录. 在 `webpack.common.js` 里配置, 便生产环境编译时可将视图与静态资源打包到其它目录.
- 视图使用 [handlebars](https://handlebarsjs.com) 模版, 增加了 `layout` 风格 `partial`, 所以对 handlebars 来说, `layout` 与 `partial` 目录里的文件都叫 `partial`. ps: handlebars 文档里提到的用 `partial` 语法实现 `layout` 在 webpack 下无法正常编译出来, 欢迎 pull request.
- 默认引入了 [Vue](https://vuejs.org) 处理复杂交互场景.
- 在页面引用 `assets` 目录里的样式或图片时使用 `~assets` 作为路径前缀,  `partials/page-navbar.hbs` 里的 `<img src="~assets/images/site-logo.png" />`.
- 参考 UI 风格决定使用 [bootstrap](https://getbootstrap.com) 或 [reset-css](https://www.npmjs.com/package/reset-css) 或 [normalize.css](https://www.npmjs.com/package/normalize.css).

## 其它

修改 Webpack 配置时请悉知每项改动造成的影响.

尽量不要将较大的第三方依赖引入页面 js, 若多页面使用, 直接配置到全局依赖里.

假定 PC 端 UI 稿宽 1680, 讨论决定 1024 以上(含)为 PC 端, 以下为移动端.

移动端视图与 PC 端视图在一个页面文件里, 注意样式里的断点,
移动端: 0 < mobile < 1024 为等比缩放,
PC 端: 1024 <= desktop <= 1680 为等比缩放,
1680 <= 时除撑满窗口宽的元素外, 其它元素保持 1680 下的元素尺寸. 注意留白位置.

当做真正的响应式的时候, 从 `layouts/master.hbs` 移除这样的配置, 从 `assets/js/app.js`, `assets/js/base.js` 移除对应的配置. 页面目录里不再需要 `-mobile` 与 `-desktop` 后缀的文件. 尽量考虑使用 [bootstrap](https://getbootstrap.com).
