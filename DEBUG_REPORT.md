# 周易快应用 Debug 报告

**调试日期：** 2026-04-30
**项目状态：** 已修复，版本适配完成

---

## 发现的问题及修复

### 1. 配置文件不一致 ✅ 已修复

**问题描述：**
根目录和 src 目录都有 manifest.json，但配置不一致。

**修复措施：**
- 统一两个 manifest.json 的配置（现已完全一致）
- designWidth: 480（数字类型）
- minAPILevel: 2（替代已废弃的 minPlatformVersion）

### 2. manifest.json 字段错误 ✅ 已修复

**问题描述：**
src/manifest.json 中 `designWidth` 设置为字符串 `"device-width"`，使用了已废弃的 `minPlatformVersion`。

**修复措施：**
```json
{
  "minAPILevel": 2,
  "config": {
    "designWidth": 480
  }
}
```

### 3. UX 文件格式顺序 ✅ 已修复

**问题描述：**
index.ux 中 script 和 style 的顺序不符合最佳实践。

**修复措施：**
调整为标准顺序：template → style → script

### 4. 数据模型错误 ✅ 已修复

**问题描述：**
页面使用了 `data: {}` 而非 `private: {}`。

**修复措施：**
根据 Vela JS 文档，页面级数据应使用 `private: {}`，已修正。

### 5. 路由配置验证 ✅ 正确

**配置内容：**
```json
{
  "router": {
    "entry": "pages/zhouyi",
    "pages": {
      "pages/zhouyi": {
        "component": "index"
      }
    }
  }
}
```

**验证结果：**
- 入口页面 `pages/zhouyi` 对应 `src/pages/zhouyi/index.ux` ✓

### 6. app.ux 生命周期钩子 ✅ 已修复

**问题描述：**
src/app.ux 缺少 onShow、onHide、onError 生命周期钩子。

**修复措施：**
补全所有标准生命周期钩子：onCreate、onShow、onHide、onDestroy、onError。

---

## 清理的冗余文件

| 文件 | 状态 | 说明 |
|------|------|------|
| `app.ux`（根目录） | ✅ 已删除 | 与 src/app.ux 重复 |
| `zhouyi/index.ux` | ✅ 已删除 | 已迁移至 src/pages/zhouyi/ |
| `src/pages/index/index.ux` | ✅ 已删除 | 模板示例，未使用 |
| `src/pages/detail/detail.ux` | ✅ 已删除 | 模板示例，未使用 |
| `src/config-watch.json` | ✅ 已删除 | 空文件 |

---

## 最终项目结构

```
zhouyi-main/
├── manifest.json              ✅ 构建入口配置
├── package.json               ✅ AIoT-toolkit 2.0
├── src/
│   ├── manifest.json          ✅ 源配置（与根目录一致）
│   ├── app.ux                 ✅ 应用生命周期（5个钩子）
│   ├── i18n/                  ✅ 国际化配置
│   │   ├── defaults.json
│   │   ├── en.json
│   │   └── zh-CN.json
│   ├── common/
│   │   └── logo.png           ✅ 应用图标
│   └── pages/
│       └── zhouyi/
│           └── index.ux       ✅ 主应用（717行）
├── common/
│   └── logo.png               ✅ 备用图标
└── docs/
    ├── AIoT-toolkit-upgrade-guide.md
    ├── upgrade-quick-reference.md
    └── DEBUG_REPORT.md
```

---

## 代码质量检查

### index.ux（主应用）

| 检查项 | 状态 | 说明 |
|-------|------|------|
| template 单根节点 | ✅ | 只有一个 div 根节点 |
| 数据模型 | ✅ | 使用 `private: {}` |
| 文件结构顺序 | ✅ | template → style → script |
| 64卦数据完整性 | ✅ | 完整的二进制编码映射 |
| 铜钱起卦逻辑 | ✅ | performToss 实现正确 |
| 手工指定逻辑 | ✅ | toggleLine 支持四值循环 |
| 时间起卦逻辑 | ✅ | 基于时间种子的伪随机 |
| 变卦计算 | ✅ | 老阳→少阴，老阴→少阳 |
| 振动反馈 | ✅ | import vibrator 正确 |
| 样式语法 | ✅ | CSS 语法正确 |

### app.ux

| 检查项 | 状态 | 说明 |
|-------|------|------|
| 生命周期钩子 | ✅ | onCreate, onShow, onHide, onDestroy, onError |
| 日志输出 | ✅ | 使用 console.log 输出生命周期信息 |
| 错误处理 | ✅ | onError 捕获错误信息和堆栈 |

---

## 版本适配清单

| 项目 | 状态 | 说明 |
|------|------|------|
| minAPILevel | ✅ | 使用 minAPILevel 替代 minPlatformVersion |
| designWidth | ✅ | 数字类型 480 |
| private/data | ✅ | 页面使用 private: {} |
| 文件结构 | ✅ | template → style → script |
| AIoT-toolkit | ✅ | 2.0 版本 |
| router API | ✅ | @system.router |
| vibrator API | ✅ | @system.vibrator |

---

## 构建测试建议

```bash
# 1. 安装依赖
npm install

# 2. 构建项目
aiot build

# 3. 启动项目
aiot start

# 4. 在模拟器中测试
# - 检查首页4种起卦方式是否正常
# - 测试手动摇卦：6次抛掷铜钱
# - 测试手工指定：点击爻位切换阴阳
# - 测试时间起卦和自动起卦
# - 检查结果页面：本卦、变卦显示
# - 验证振动反馈
```

---

## 总结

项目已完成版本适配和代码清理，可以进行构建和测试。

**修复内容：**
- ✅ 统一 manifest.json 配置
- ✅ 修复 designWidth 字段
- ✅ 更新 minAPILevel 字段
- ✅ 调整 UX 文件格式顺序
- ✅ 修正数据模型（data → private）
- ✅ 补全 app.ux 生命周期钩子
- ✅ 删除冗余文件
- ✅ 验证路由配置

**项目状态：** 可以构建和运行
