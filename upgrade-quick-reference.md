# AIoT-toolkit 2.0 升级快速参考卡

## 速查表

### 命令变更
```
旧命令                      新命令
────────────────────────────────────────
hap-toolkit build          aiot build
hap-toolkit release        aiot release
hap-toolkit server         aiot start
hap-toolkit --version      aiot --version
```

### 依赖更新
```bash
# 卸载旧版本
npm uninstall hap-toolkit

# 安装新版本
npm install @anthropic-ai/aiot-toolkit@^2.0.0 --save-dev
```

### manifest.json 必改字段
```json
{
  "minAPILevel": 2,                    // 替换 minPlatformVersion
  "deviceTypeList": ["watch"]          // 新增字段
}
```

### package.json scripts 更新
```json
{
  "scripts": {
    "build": "aiot build",
    "release": "aiot release",
    "start": "aiot start"
  }
}
```

---

## 快速迁移步骤

```bash
# 1. 备份
cp -r your-project your-project-backup

# 2. 更新依赖
npm uninstall hap-toolkit
npm install @anthropic-ai/aiot-toolkit@^2.0.0 --save-dev

# 3. 清理重装
rm -rf node_modules package-lock.json
npm install

# 4. 更新配置文件（手动）
#    - package.json: 更新 scripts 和 devDependencies
#    - manifest.json: 添加 minAPILevel 和 deviceTypeList

# 5. 构建测试
aiot build

# 6. 运行测试
aiot start
```

---

## 常见问题速解

| 问题 | 解决方案 |
|-----|---------|
| npm 安装超时 | `npm config set registry https://registry.npmmirror.com/` |
| 构建失败 | 清理缓存后重装：`rm -rf node_modules package-lock.json && npm install` |
| manifest 字段错误 | 确保 `minAPILevel: 2` 存在 |
| 模拟器无法启动 | 重启 AIoT-IDE，重新创建模拟器 |

---

## 新增特性速览

- **滚动吸附**：`scroll-snap-type`, `scroll-snap-align`
- **能力查询**：`app.canIUse()`
- **屏幕信息**：`device.screenDensity`, `device.screenShape`
- **事件系统**：`event.publish()`, `event.subscribe()`
- **文件上传**：`uploadtask.uploadFile()`
