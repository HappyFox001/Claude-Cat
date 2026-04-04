# Claude Hook 集成指南

## 快速开始

### 1. 启动应用（重要！）

**正确的启动命令：**
```bash
pnpm dev
# 或者
pnpm tauri dev
```

**❌ 不要使用：**
```bash
pnpm dev:vite  # 这只启动前端，不会启动 Tauri 后端
```

### 2. 检查日志

应用启动后，打开浏览器开发者工具（F12），你应该看到：

```
[Claude State] Initialized - Listening for claude-state-change events
[Claude State] State mappings: {idle: 0, thinking: 1, ...}
[Claude State] Debug function available: window.testClaudeState(state)
```

如果看到这些日志，说明初始化成功。

### 3. 测试表情切换

在浏览器控制台执行：

```javascript
// 方法 1: 使用测试函数
testClaudeState('thinking')   // 应该切换到 question 表情
testClaudeState('error')      // 应该切换到 angry 表情
testClaudeState('celebrate')  // 应该切换到 excited 表情

// 方法 2: 直接测试表情
live2d.playExpressions(1)  // question
live2d.playExpressions(2)  // angry
live2d.playExpressions(6)  // excited
```

预期看到的日志：
```
[Claude State] Received state: thinking
[Claude State] thinking → Expression #1 (question)
[Live2D] Playing expression #1
```

## 诊断问题

### 运行诊断脚本

```powershell
.\scripts\diagnose.ps1
```

这会检查：
- Claude 设置文件
- Hook 脚本
- 状态文件
- Rust 依赖

### 手动检查清单

#### ✅ 1. 检查模型是否加载

```javascript
console.log('Model loaded:', live2d.model !== null)
```

应该返回 `true`。如果是 `false`，等待模型加载完成。

#### ✅ 2. 检查初始化日志

刷新页面，查看控制台是否有：
```
[Claude State] Initialized - Listening for claude-state-change events
```

如果没有，检查 `src/pages/main/index.vue` 是否调用了 `useClaudeState()`。

#### ✅ 3. 检查状态文件

```powershell
# 查看状态文件
Get-Content ~/.bongo-cat/status.json

# 实时监听文件变化
Get-Content ~/.bongo-cat/status.json -Wait
```

#### ✅ 4. 手动触发状态

```powershell
# 测试 hook 脚本
.\hooks\bongo-cat-hook.ps1 -State thinking

# 等待 1 秒，查看应用是否有反应
```

#### ✅ 5. 检查 Hook 是否安装

```powershell
Get-Content ~/.claude/settings.json | Select-String "bongo-cat"
```

如果没有输出，运行：
```powershell
.\scripts\install-hooks.ps1
```

## 常见问题

### Q1: 控制台没有任何日志

**原因：** 可能使用了 `pnpm dev:vite`，这不会启动 Tauri 后端。

**解决：** 使用 `pnpm dev` 或 `pnpm tauri dev`

### Q2: 提示 "Can't find variable: testClaudeState"

**原因：**
1. 应用未在开发模式运行
2. useClaudeState 未初始化

**解决：**
1. 确保使用 `pnpm dev`
2. 检查控制台是否有初始化日志

### Q3: 日志显示但表情不变化

**可能原因：**
1. 模型未加载
2. 表情文件缺失
3. FadeInTime 太长看不出变化

**解决：**
```javascript
// 检查模型
console.log('Model:', live2d.model)

// 直接测试表情（应该立即看到变化）
live2d.playExpressions(2)  // angry - 应该皱眉
live2d.playExpressions(6)  // excited - 应该眼睛发光
```

### Q4: Hook 触发但应用没反应

**检查步骤：**

1. 确认状态文件已更新：
```powershell
Get-Content ~/.bongo-cat/status.json
```

2. 查看 Tauri 日志（终端）：
```
[INFO] Started Claude status watcher
[INFO] Watching: /Users/.../.bongo-cat/status.json
[INFO] State changed: thinking
```

3. 如果没有看到 Rust 日志，检查 Rust 编译：
```bash
cd src-tauri
cargo build
```

## 测试脚本

### 自动测试所有状态

```javascript
async function testAllStates() {
  const states = [
    'idle', 'thinking', 'coding',
    'reading', 'running', 'error', 'celebrate'
  ]

  for (const state of states) {
    console.log(`\n=== Testing: ${state} ===`)
    testClaudeState(state)
    await new Promise(r => setTimeout(r, 3000))
  }
}

testAllStates()
```

### 自动测试所有表情

```javascript
async function testAllExpressions() {
  const names = [
    'normal', 'question', 'angry', 'sad', 'cry',
    'surprised', 'excited', 'fluffy', 'knife', 'long', 'no_pupil'
  ]

  for (let i = 0; i < names.length; i++) {
    console.log(`\n=== Expression #${i}: ${names[i]} ===`)
    live2d.playExpressions(i)
    await new Promise(r => setTimeout(r, 2500))
  }
}

testAllExpressions()
```

## 状态映射

| Claude 状态 | 表情索引 | 表情名称 | 触发事件 |
|------------|---------|---------|---------|
| idle | 0 | normal | Stop |
| thinking | 1 | question | UserPromptSubmit |
| coding | 0 | normal | PreToolUse(Edit/Write) |
| reading | 1 | question | PreToolUse(Read/Glob/Grep) |
| running | 6 | excited | PreToolUse(Bash) |
| error | 2 | angry | PostToolUseFailure |
| celebrate | 6 | excited | TaskCompleted |

## 自定义

### 修改状态映射

编辑 `src/composables/useClaudeState.ts`:

```typescript
const STATE_TO_EXPRESSION: Record<string, number> = {
  'idle': 0,
  'thinking': 1,
  'coding': 7,      // 改成 fluffy
  'reading': 1,
  'running': 6,
  'error': 2,
  'celebrate': 5,   // 改成 surprised
}
```

### 调整防抖时间

```typescript
const EXPRESSION_COOLDOWN = 800  // 毫秒
```

## 需要帮助？

如果问题仍未解决，请提供以下信息：

1. 启动命令
2. 浏览器控制台日志截图
3. 终端输出（Rust 日志）
4. `diagnose.ps1` 的输出
