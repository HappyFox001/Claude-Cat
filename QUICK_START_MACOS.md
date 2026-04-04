# BongoCat - macOS 快速开始指南

## 1. 启动应用

```bash
cd /Users/0xhacker/Desktop/work/DeskSpirit/BongoCat
pnpm dev
```

等待应用启动，会打开一个透明窗口显示 void_cat 模型。

## 2. 打开开发者工具测试

**打开开发者工具：**
- 右键点击窗口 → 检查（Inspect）
- 或者按 `Cmd+Option+I`

**查看控制台，应该看到：**
```
[Claude State] Initialized - Listening for claude-state-change events
[Claude State] State mappings: {idle: 0, thinking: 1, ...}
[Claude State] Debug function available: window.testClaudeState(state)
```

## 3. 在控制台测试表情

```javascript
// 测试不同状态
testClaudeState('thinking')   // 疑问表情
testClaudeState('error')      // 生气表情
testClaudeState('celebrate')  // 兴奋表情

// 或直接测试表情索引
live2d.playExpressions(1)  // question
live2d.playExpressions(2)  // angry
live2d.playExpressions(6)  // excited
```

**预期日志：**
```
[Claude State] Received state: thinking
[Claude State] thinking → Expression #1 (question)
[Live2D] Playing expression #1
```

## 4. 安装 Claude Code Hook（可选）

如果要让模型跟随 Claude Code 状态变化：

```bash
# 安装 hook
./scripts/install-hooks.sh

# 重启 Claude Code
```

## 5. 手动测试 Hook

```bash
# 触发思考状态
./hooks/bongo-cat-hook.sh thinking

# 等待1秒，查看模型是否变化
# 控制台应该显示日志

# 测试其他状态
./hooks/bongo-cat-hook.sh error
./hooks/bongo-cat-hook.sh celebrate
```

## 6. 诊断问题

```bash
./scripts/diagnose.sh
```

这会检查所有配置并自动测试 hook。

## 快速测试脚本

在浏览器控制台执行：

```javascript
// 自动测试所有状态
async function test() {
  const states = ['idle', 'thinking', 'coding', 'reading', 'running', 'error', 'celebrate']
  for (const s of states) {
    console.log(`\n=== Testing: ${s} ===`)
    testClaudeState(s)
    await new Promise(r => setTimeout(r, 3000))
  }
}
test()
```

## 常见问题

### Q: 控制台没有日志
**A:** 确保使用 `pnpm dev` 而不是 `pnpm dev:vite`

### Q: 提示 "Can't find variable: testClaudeState"
**A:** 刷新页面，确保看到初始化日志

### Q: 表情不变化
**A:** 检查模型是否加载：
```javascript
console.log('Model loaded:', live2d.model !== null)
```

### Q: Hook 不工作
**A:** 运行诊断脚本：
```bash
./scripts/diagnose.sh
```

## 状态映射

| Claude 状态 | 表情 | 触发事件 |
|------------|------|---------|
| idle | normal (0) | Stop |
| thinking | question (1) | UserPromptSubmit |
| coding | normal (0) | Edit/Write |
| reading | question (1) | Read/Glob/Grep |
| running | excited (6) | Bash |
| error | angry (2) | ToolUseFailure |
| celebrate | excited (6) | TaskCompleted |

## 监控状态文件

```bash
# 实时查看状态变化
tail -f ~/.bongo-cat/status.json
```

## 卸载 Hook

```bash
./scripts/uninstall-hooks.sh
```
