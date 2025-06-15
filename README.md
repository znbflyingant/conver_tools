# Java to Dart 代码转换器

一个在线的 Java 代码转换为 Dart 代码的工具。

## 功能特性

- 在线 Java 到 Dart 代码转换
- 支持多种 Java 语法结构
- 实时转换预览
- 代码格式化
- 一键复制结果

## 本地运行

直接打开 `java_to_dart_converter.html` 文件即可在浏览器中使用。

## Netlify 部署

### 方法一：Git 仓库部署（推荐）

1. 将代码推送到 GitHub/GitLab 仓库
2. 登录 [Netlify](https://netlify.com)
3. 点击 "New site from Git"
4. 选择您的仓库
5. 构建设置：
   - Build command: 留空
   - Publish directory: `.`
6. 点击 "Deploy site"

### 方法二：拖拽部署

1. 登录 [Netlify](https://netlify.com)
2. 将整个项目文件夹拖拽到 Netlify 的部署区域
3. 等待部署完成

## 文件结构

```
├── index.html                      # 入口文件
├── java_to_dart_converter.html     # 主转换器页面
├── converter.js                    # 转换逻辑
├── netlify.toml                    # Netlify 配置
└── README.md                       # 项目说明
```

## 技术栈

- HTML5
- CSS3
- JavaScript (ES6+)
- JSZip (用于文件处理)

## 浏览器支持

- Chrome (推荐)
- Firefox
- Safari
- Edge

## 许可证

MIT License 