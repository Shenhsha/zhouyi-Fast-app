# AIoT-toolkit 1.0 升级到 2.0 迁移指南

> 本文档帮助开发者从 AIoT-toolkit 1.0 平滑升级到 2.0 版本，涵盖主要变更、注意事项和迁移步骤。

---

## 目录

1. [升级前准备](#升级前准备)
2. [主要变更概览](#主要变更概览)
3. [项目配置变更](#项目配置变更)
4. [构建命令变更](#构建命令变更)
5. [依赖管理变更](#依赖管理变更)
6. [API 变更](#api-变更)
7. [组件变更](#组件变更)
8. [样式系统变更](#样式系统变更)
9. [调试工具变更](#调试工具变更)
10. [常见问题与解决方案](#常见问题与解决方案)
11. [迁移检查清单](#迁移检查清单)

---

## 升级前准备

### 1. 环境要求

**AIoT-toolkit 2.0 系统要求：**

| 操作系统 | 最低版本要求 |
|---------|------------|
| macOS | 14 (Sonoma) 及以上 |
| Windows | 10 或更高版本 |
| Ubuntu | 20.04 LTS 或更高版本 |

### 2. 备份项目

升级前请务必备份当前项目：

```bash
# 创建项目备份
cp -r your-project your-project-backup

# 或使用 git 创建备份分支
git checkout -b backup-before-upgrade
git add .
git commit -m "备份：升级前项目状态"
```

### 3. 检查当前版本

确认当前使用的 toolkit 版本：

```bash
# 检查 aiot 命令版本
aiot --version

# 检查项目中的 toolkit 版本（如有）
cat package.json | grep -i toolkit
```

---

## 主要变更概览

### 核心变化

| 变更项 | 1.0 版本 | 2.0 版本 | 影响程度 |
|-------|---------|---------|---------|
| 命令行工具 | `hap-toolkit` | `aiot` | **重大** |
| 配置文件格式 | 旧版 manifest.json | 新版 manifest.json | **中等** |
| 依赖包名称 | `hap-toolkit` | `@anthropic-ai/aiot-toolkit` | **重大** |
| 构建输出目录 | `build/` + `dist/` | `build/` + `dist/` (结构优化) | **低** |
| 调试工具 | 内置调试器 | 增强调试器 | **低** |
| 模拟器管理 | 手动配置 | 自动化管理 | **低** |

### 新增特性

- **增强的模拟器管理**：支持自动初始化、创建、删除模拟器
- **改进的调试体验**：DOM 树查看、Console 面板、断点调试
- **优化的构建性能**：更快的编译速度和更小的包体积
- **多屏适配增强**：更好的圆形/矩形/胶囊形屏幕支持
- **TypeScript 支持**：可选的 TypeScript 类型检查

---

## 项目配置变更

### 1. package.json 更新

**1.0 版本：**
```json
{
  "name": "your-app",
  "version": "1.0.0",
  "scripts": {
    "build": "hap-toolkit build",
    "release": "hap-toolkit release",
    "start": "hap-toolkit server"
  },
  "devDependencies": {
    "hap-toolkit": "^1.0.0"
  }
}
```

**2.0 版本：**
```json
{
  "name": "your-app",
  "version": "1.0.0",
  "scripts": {
    "build": "aiot build",
    "release": "aiot release",
    "start": "aiot start"
  },
  "devDependencies": {
    "@anthropic-ai/aiot-toolkit": "^2.0.0"
  }
}
```

**迁移步骤：**
```bash
# 1. 卸载旧版本
npm uninstall hap-toolkit

# 2. 安装新版本
npm install @anthropic-ai/aiot-toolkit@^2.0.0 --save-dev

# 3. 更新 package.json 中的 scripts
```

### 2. manifest.json 变更

**新增字段：**

```json
{
  "package": "com.example.yourapp",
  "name": "Your App",
  "versionName": "1.0.0",
  "versionCode": 1,
  "minAPILevel": 2,
  "icon": "/common/logo.png",
  "deviceTypeList": ["watch"],
  "features": [
    { "name": "system.router" }
  ],
  "config": {
    "logLevel": "log",
    "designWidth": 480,
    "background": {
      "features": []
    }
  },
  "router": {
    "entry": "Index",
    "pages": {
      "Index": {
        "component": "index"
      }
    }
  },
  "display": {
    "backgroundColor": "#ffffff"
  },
  "permissions": []
}
```

**关键变更说明：**

| 字段 | 变更说明 | 是否必须更新 |
|-----|---------|------------|
| `minAPILevel` | 从 `minPlatformVersion` 改为 `minAPILevel`，建议设置为 `2` | **是** |
| `deviceTypeList` | 新增字段，指定支持的设备类型 | 建议添加 |
| `permissions` | 权限声明格式优化 | 按需更新 |
| `config.background` | 后台运行配置格式变更 | 按需更新 |

### 3. 构建配置文件

**新增 `quickapp.config.js`（可选）：**

```javascript
module.exports = {
  // CLI 配置
  cli: {
    devtool: "source-map",
  },

  // 构建钩子
  postHook: (config) => {
    if (config.mode === "production") {
      // 生产环境优化
      config.optimization.minimize = true;
    }
  }
};
```

---

## 构建命令变更

### 命令对照表

| 功能 | 1.0 命令 | 2.0 命令 |
|-----|---------|---------|
| 开发构建 | `hap-toolkit build` | `aiot build` |
| 生产构建 | `hap-toolkit release` | `aiot release` |
| 启动服务 | `hap-toolkit server` | `aiot start` |
| 查看帮助 | `hap-toolkit --help` | `aiot --help` |
| 查看版本 | `hap-toolkit --version` | `aiot --version` |

### 编译参数变更

**查看可用参数：**
```bash
# 1.0 版本
hap-toolkit build --help

# 2.0 版本
aiot build -h
```

**常用编译参数：**

| 参数 | 说明 | 示例 |
|-----|------|-----|
| `--devtool` | Source map 生成方式 | `aiot build --devtool=source-map` |
| `--enable-jsc` | 启用 JSC 引擎 | `aiot build --enable-jsc=true` |
| `--enable-protobuf` | 启用 Protobuf 支持 | `aiot build --enable-protobuf=true` |
| `--enable-custom-component` | 启用自定义组件 | `aiot build --enable-custom-component=true` |

---

## 依赖管理变更

### 1. 核心依赖更新

```bash
# 卸载旧依赖
npm uninstall hap-toolkit

# 安装新依赖
npm install @anthropic-ai/aiot-toolkit@^2.0.0 --save-dev

# 清理 node_modules 并重新安装
rm -rf node_modules package-lock.json
npm install
```

### 2. npm 配置优化

如果遇到 npm 包下载失败，配置国内镜像源：

**创建或更新 `.npmrc` 文件：**
```ini
registry=https://registry.npmmirror.com/
```

### 3. 依赖版本兼容性

| 依赖类型 | 1.0 兼容版本 | 2.0 兼容版本 |
|---------|------------|------------|
| Node.js | >= 14.0.0 | >= 16.0.0 |
| npm | >= 6.0.0 | >= 8.0.0 |

---

## API 变更

### 1. 系统接口变更

**接口声明格式（无变化）：**
```json
{
  "features": [
    { "name": "system.router" },
    { "name": "system.fetch" },
    { "name": "system.storage" }
  ]
}
```

**导入方式（无变化）：**
```javascript
import router from '@system.router'
import fetch from '@system.fetch'
import storage from '@system.storage'
```

### 2. 新增 API

**2.0 版本新增的 API：**

| API | 说明 | API Level |
|-----|------|-----------|
| `app.canIUse()` | 查询能力支持 | 3+ |
| `device.screenDensity` | 屏幕密度 | 3+ |
| `device.screenShape` | 屏幕形状（新增 pill-shaped） | 3+ |
| `event` | 公共事件系统 | 4+ |
| `uploadtask` | 文件上传 | 3+ |
| `scroll.snap` | 滚动吸附 | 3+ |

### 3. 废弃 API

以下 API 在 2.0 中已废弃，建议使用替代方案：

| 废弃 API | 替代方案 | 说明 |
|---------|---------|------|
| `minPlatformVersion` | `minAPILevel` | manifest.json 字段名变更 |
| 旧版动画语法 | 新版动画语法 | 更丰富的动画支持 |

---

## 组件变更

### 1. 基础组件

**无重大变更**，所有基础组件保持向后兼容。

### 2. 容器组件

**新增属性：**

```html
<!-- scroll 组件新增滚动吸附 -->
<scroll scroll-y="true" style="scroll-snap-type: y proximity;">
  <div style="scroll-snap-align: start;">内容1</div>
  <div style="scroll-snap-align: center;">内容2</div>
</scroll>
```

### 3. 表单组件

**无重大变更**，所有表单组件保持向后兼容。

### 4. 自定义组件

**组件引入方式（无变化）：**
```html
<import name="my-component" src="./my-component.ux"></import>

<template>
  <div>
    <my-component></my-component>
  </div>
</template>
```

---

## 样式系统变更

### 1. 选择器支持

**支持的选择器（无变化）：**
- 类选择器：`.class`
- ID 选择器：`#id`
- 标签选择器：`div`
- 分组选择器：`.a, .b`

**不支持的选择器（无变化）：**
- 后代选择器：`.a .b`
- 子选择器：`.a > .b`
- 伪类选择器：`:hover`, `:focus`
- 伪元素选择器：`::before`, `::after`

### 2. 新增样式属性

**2.0 新增样式：**

| 属性 | 说明 | 示例 |
|-----|------|-----|
| `scroll-snap-type` | 滚动吸附类型 | `scroll-snap-type: x proximity` |
| `scroll-snap-align` | 滚动吸附对齐 | `scroll-snap-align: center` |
| `scroll-snap-stop` | 滚动吸附停止 | `scroll-snap-stop: always` |

### 3. 样式预编译

**支持 Less 和 Sass（无变化）：**
```html
<style lang="less">
  @primary-color: #09ba07;
  .page {
    background-color: @primary-color;
  }
</style>
```

---

## 调试工具变更

### 1. AIoT-IDE 调试功能

**2.0 版本增强功能：**

- **DOM 树查看**：实时查看页面元素结构
- **Console 面板**：查看日志输出和错误信息
- **断点调试**：支持 JavaScript 断点调试
- **网络请求监控**：查看网络请求和响应

### 2. 模拟器管理

**自动初始化：**
1. 打开 AIoT-IDE
2. 点击右侧开发向导
3. 选择「自动安装」模拟器环境
4. 创建模拟器实例

**手动创建模拟器：**
1. 点击「模拟器」按钮
2. 点击左上角「创建」按钮
3. 填写模拟器信息
4. 推荐使用 Vela 正式版（4.0）镜像

### 3. 调试命令

```bash
# 启动调试模式
aiot start --debug

# 指定模拟器
aiot start --emulator <emulator-name>
```

---

## 常见问题与解决方案

### Q1: 升级后构建失败

**问题描述：** 执行 `aiot build` 时报错

**解决方案：**
```bash
# 1. 清理缓存
rm -rf node_modules package-lock.json build dist

# 2. 重新安装依赖
npm install

# 3. 检查 Node.js 版本
node --version  # 确保 >= 16.0.0

# 4. 重新构建
aiot build
```

### Q2: npm 安装超时

**问题描述：** `npm install` 时下载超时

**解决方案：**
```bash
# 使用国内镜像源
npm config set registry https://registry.npmmirror.com/

# 或在项目根目录创建 .npmrc 文件
echo 'registry=https://registry.npmmirror.com/' > .npmrc

# 重新安装
npm install
```

### Q3: manifest.json 字段错误

**问题描述：** 构建时报 manifest.json 字段错误

**解决方案：**
```json
{
  "minAPILevel": 2,
  "deviceTypeList": ["watch"],
  "config": {
    "logLevel": "log",
    "designWidth": 480
  }
}
```

### Q4: 模拟器无法启动

**问题描述：** 点击运行后模拟器无响应

**解决方案：**
1. 检查模拟器环境是否已安装
2. 确认模拟器实例已创建
3. 重启 AIoT-IDE
4. 检查系统环境变量

### Q5: 自定义组件报错

**问题描述：** 自定义组件无法正常渲染

**解决方案：**
```html
<!-- 确保组件引入正确 -->
<import name="my-comp" src="./my-comp.ux"></import>

<!-- 确保组件名与 import name 一致 -->
<template>
  <my-comp></my-comp>
</template>
```

---

## 迁移检查清单

### 基础检查

- [ ] 备份当前项目
- [ ] 检查 Node.js 版本 >= 16.0.0
- [ ] 检查 npm 版本 >= 8.0.0
- [ ] 卸载旧版 `hap-toolkit`
- [ ] 安装新版 `@anthropic-ai/aiot-toolkit`

### 配置文件检查

- [ ] 更新 `package.json` 中的 scripts
- [ ] 更新 `package.json` 中的 devDependencies
- [ ] 更新 `manifest.json` 中的 `minAPILevel` 字段
- [ ] 添加 `deviceTypeList` 字段（如需要）
- [ ] 检查 `config` 字段格式
- [ ] 检查 `features` 字段格式

### 代码检查

- [ ] 检查所有 `import` 语句是否正确
- [ ] 检查 API 调用是否使用新语法
- [ ] 检查组件属性是否兼容
- [ ] 检查样式属性是否兼容
- [ ] 运行构建命令确认无错误

### 测试验证

- [ ] 在模拟器中运行应用
- [ ] 测试所有页面功能
- [ ] 测试页面跳转
- [ ] 测试数据请求
- [ ] 测试本地存储
- [ ] 测试设备 API（如振动、传感器等）

### 性能优化

- [ ] 检查包体积是否合理
- [ ] 检查内存使用情况
- [ ] 优化图片资源
- [ ] 清理未使用的代码

---

## 迁移示例

### 完整迁移步骤

```bash
# 1. 备份项目
cp -r my-project my-project-backup

# 2. 进入项目目录
cd my-project

# 3. 卸载旧版本
npm uninstall hap-toolkit

# 4. 安装新版本
npm install @anthropic-ai/aiot-toolkit@^2.0.0 --save-dev

# 5. 清理缓存
rm -rf node_modules package-lock.json build dist

# 6. 重新安装依赖
npm install

# 7. 更新配置文件（手动编辑 manifest.json 和 package.json）

# 8. 测试构建
aiot build

# 9. 运行测试
aiot start
```

### 更新 package.json

```json
{
  "name": "your-app",
  "version": "1.0.0",
  "description": "Your app description",
  "main": "app.ux",
  "scripts": {
    "build": "aiot build",
    "release": "aiot release",
    "start": "aiot start"
  },
  "devDependencies": {
    "@anthropic-ai/aiot-toolkit": "^2.0.0"
  }
}
```

### 更新 manifest.json

```json
{
  "package": "com.example.yourapp",
  "name": "Your App",
  "versionName": "1.0.0",
  "versionCode": 1,
  "minAPILevel": 2,
  "icon": "/common/logo.png",
  "deviceTypeList": ["watch"],
  "features": [
    { "name": "system.router" },
    { "name": "system.fetch" },
    { "name": "system.storage" }
  ],
  "config": {
    "logLevel": "log",
    "designWidth": 480
  },
  "router": {
    "entry": "Index",
    "pages": {
      "Index": {
        "component": "index"
      }
    }
  },
  "display": {
    "backgroundColor": "#000000"
  }
}
```

---

## 参考资源

- [Xiaomi Vela JS 应用开发文档](https://iot.mi.com/vela/quickapp/zh/)
- [AIoT-IDE 下载地址](https://kpan.mioffice.cn/webfolder/ext/j6SfQsarf8I%40?n=0.18700074913007825)
- [API Level 说明](https://iot.mi.com/vela/quickapp/zh/guide/version/)
- [组件文档](https://iot.mi.com/vela/quickapp/zh/components/)
- [接口文档](https://iot.mi.com/vela/quickapp/zh/features/)

---

## 技术支持

如遇到升级问题，请通过以下方式获取支持：

- 邮箱：zhangyuanpu@xiaomi.com
- 官方文档：https://iot.mi.com/vela/quickapp/zh/

---

**文档版本：** 1.0
**更新日期：** 2026-04-30
**适用版本：** AIoT-toolkit 1.0 → 2.0
