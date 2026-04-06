# DeskSpirit 开发计划

## 项目愿景

将 BongoCat 改造为 **Claude Code 专属桌面宠物**——一只能够感知 Claude 工作状态、陪伴开发者编程的智能小黑猫。

核心理念：**你的 AI 编程伙伴，不只是工具，更是陪伴。**

---

## 一、控制面板优化

### 1.1 需要移除的功能

| 模块 | 移除项 | 原因 |
|------|--------|------|
| 猫咪设置 | `model.single` 单一模式 | 不再支持键盘模式 |
| 猫咪设置 | `model.autoReleaseDelay` | 键盘相关，不需要 |
| 快捷键 | 整个模块可精简 | 只保留必要的 2-3 个快捷键 |
| 模型管理 | 模型上传功能 | 专注单一黑猫模型 |
| Store | `supportKeys` / `pressedKeys` | 键盘状态追踪已废弃 |

### 1.2 需要新增的功能

| 模块 | 新增项 | 说明 |
|------|--------|------|
| **Claude 面板** | 状态显示 | 实时显示 Claude 当前状态 |
| **Claude 面板** | Token 统计 | 今日/本周/本月使用量 |
| **Claude 面板** | 工作时长 | Claude 活跃时间统计 |
| **宠物面板** | 等级/经验 | 基于使用量的成长系统 |
| **宠物面板** | 心情状态 | 基于工作模式的心情变化 |
| **宠物面板** | 成就系统 | 里程碑徽章 |

### 1.3 优化后的面板结构

```
偏好设置
├── 宠物状态 (新)      # 等级、经验、心情、成就
├── Claude 统计 (新)   # Token、状态、工作时长
├── 显示设置           # 位置、大小、透明度、置顶
├── 通用设置           # 主题、语言、开机启动
└── 关于               # 版本、更新、反馈
```

---

## 二、UI 设计优化

### 2.1 主题色彩

基于黑猫主题的暗色调设计：

```css
/* 主色调 */
--primary: #7C3AED;        /* 紫色 - 神秘感 */
--primary-light: #A78BFA;
--primary-dark: #5B21B6;

/* 背景色 */
--bg-dark: #0F0F0F;        /* 深黑 */
--bg-card: #1A1A1A;        /* 卡片背景 */
--bg-hover: #252525;       /* 悬停态 */

/* 强调色 */
--accent-success: #10B981; /* 成功/庆祝 - 绿色 */
--accent-warning: #F59E0B; /* 思考中 - 琥珀色 */
--accent-error: #EF4444;   /* 错误 - 红色 */
--accent-info: #3B82F6;    /* 运行中 - 蓝色 */

/* 文字色 */
--text-primary: #F5F5F5;
--text-secondary: #A3A3A3;
--text-muted: #525252;
```

### 2.2 UI 组件风格

- **圆润边角**: 8-12px 圆角，呼应猫咪的柔软感
- **微妙动效**: 状态切换时的平滑过渡
- **猫爪元素**: 按钮、图标融入猫爪设计
- **眼睛指示器**: 用猫眼作为状态指示灯

### 2.3 状态视觉反馈

| 状态 | 猫咪表情 | UI 颜色 | 眼睛效果 |
|------|----------|---------|----------|
| idle | 普通 | 默认紫 | 正常瞳孔 |
| thinking | 疑问 | 琥珀色 | 瞳孔放大 |
| coding | 专注 | 蓝色 | 瞳孔缩小 |
| running | 兴奋 | 青色 | 眼睛发光 |
| error | 生气 | 红色 | 瞳孔变细 |
| celebrate | 开心 | 绿色 | 眯眼笑 |

---

## 三、宠物系统设计

### 3.1 等级与经验系统

**经验来源**：

| 行为 | 经验值 | 说明 |
|------|--------|------|
| Claude 完成一次任务 | +10 | 基础经验 |
| 连续工作 1 小时 | +50 | 专注奖励 |
| 首次使用某个工具 | +20 | 探索奖励 |
| 解决错误 (error → celebrate) | +30 | 成功修复 |
| 每消耗 1K tokens | +5 | 使用量转化 |

**等级设计**：

```
Lv.1  小奶猫      0 - 100 EXP
Lv.2  好奇猫      100 - 300 EXP
Lv.3  学徒猫      300 - 600 EXP
Lv.4  程序猫      600 - 1000 EXP
Lv.5  工程猫      1000 - 1500 EXP
Lv.6  架构猫      1500 - 2100 EXP
Lv.7  专家猫      2100 - 2800 EXP
Lv.8  大师猫      2800 - 3600 EXP
Lv.9  传说猫      3600 - 4500 EXP
Lv.10 神话猫      4500+ EXP
```

### 3.2 心情系统

**心情状态**：

| 心情 | 触发条件 | 视觉效果 |
|------|----------|----------|
| 开心 | 连续成功 3 次以上 | 眯眼、尾巴摇摆 |
| 专注 | coding 状态持续 5 分钟 | 瞳孔缩小、耳朵竖起 |
| 困惑 | thinking 状态超过 30 秒 | 歪头、问号表情 |
| 沮丧 | 连续 error 2 次以上 | 耳朵下垂、眼神黯淡 |
| 兴奋 | running 状态 + 大量输出 | 眼睛发光、蹦跳 |
| 困倦 | idle 超过 10 分钟 | 打哈欠、闭眼 |

### 3.3 成就系统

**里程碑成就**：

```
🐱 初次见面        - 首次启动应用
🔧 初试身手        - 完成第一次 Claude 任务
📝 代码新手        - 累计生成 100 行代码
🏃 马拉松          - 连续工作 4 小时
🎯 百发百中        - 连续 10 次任务成功
🔥 燃烧的 Token    - 单日消耗 100K tokens
🌙 夜猫子          - 在凌晨 2-5 点工作
📚 博学多才        - 使用超过 20 种不同工具
🏆 代码大师        - 达到 Lv.10
⭐ 完美主义者      - 连续 50 次任务无错误
```

### 3.4 数据持久化

```typescript
interface PetState {
  // 基础属性
  level: number
  experience: number
  totalExperience: number

  // 心情系统
  mood: 'happy' | 'focused' | 'confused' | 'sad' | 'excited' | 'sleepy'
  moodScore: number  // 0-100

  // 统计数据
  stats: {
    totalTasks: number
    successfulTasks: number
    totalTokens: number
    totalWorkTime: number  // 分钟
    toolsUsed: Set<string>
    longestStreak: number  // 连续成功
  }

  // 成就
  achievements: string[]
  achievementProgress: Record<string, number>

  // 时间记录
  createdAt: number
  lastActiveAt: number
}
```

---

## 四、Claude Code 集成

### 4.1 可获取的信息

通过 Claude Code hooks 和状态文件，可以获取：

| 信息 | 获取方式 | 用途 |
|------|----------|------|
| 当前状态 | `~/.bongo-cat/status.json` | 表情切换 |
| 状态时间戳 | status.json | 计算工作时长 |
| 工具调用 | hooks 注入 | 工具使用统计 |
| 任务结果 | hooks 注入 | 成功/失败判断 |

### 4.2 Hook 增强方案

在 `~/.claude/hooks/` 中配置：

```bash
# bongo-cat-hook.sh
#!/bin/bash

STATUS_FILE="$HOME/.bongo-cat/status.json"

# 根据事件类型更新状态
case "$CLAUDE_EVENT" in
  "tool_start")
    echo '{"state":"running","tool":"'$CLAUDE_TOOL'"}' > "$STATUS_FILE"
    ;;
  "tool_end")
    if [ "$CLAUDE_SUCCESS" = "true" ]; then
      echo '{"state":"celebrate"}' > "$STATUS_FILE"
    else
      echo '{"state":"error"}' > "$STATUS_FILE"
    fi
    ;;
  "thinking")
    echo '{"state":"thinking"}' > "$STATUS_FILE"
    ;;
  "idle")
    echo '{"state":"idle"}' > "$STATUS_FILE"
    ;;
esac
```

### 4.3 未来扩展：从应用启动 Claude

**设想功能**：
- 在宠物窗口右键菜单添加「开始工作」
- 打开指定项目目录
- 自动启动 Claude Code
- 宠物进入「待命」状态

**技术实现**：
```rust
// 通过 Tauri 的 shell 插件启动 Claude
use tauri_plugin_shell::ShellExt;

#[tauri::command]
async fn start_claude_session(app: AppHandle, project_path: String) -> Result<(), String> {
    app.shell()
        .command("claude")
        .args(["--project", &project_path])
        .spawn()
        .map_err(|e| e.to_string())?;
    Ok(())
}
```

---

## 五、开发优先级

### Phase 1: 基础优化 (1-2 周)
- [x] 移除键盘/手柄输入逻辑
- [x] 移除动作召回逻辑
- [ ] 精简控制面板
- [ ] UI 主题色适配黑猫

### Phase 2: 宠物系统 (2-3 周)
- [ ] 等级/经验系统实现
- [ ] 心情系统实现
- [ ] 数据持久化
- [ ] 宠物状态面板 UI

### Phase 3: Claude 深度集成 (2-3 周)
- [ ] Hook 增强
- [ ] Token 统计
- [ ] 工具使用统计
- [ ] Claude 统计面板 UI

### Phase 4: 成就与社交 (1-2 周)
- [ ] 成就系统
- [ ] 成就展示 UI
- [ ] （可选）数据导出/分享

---

## 六、技术注意事项

### 6.1 状态持久化
- 使用 `tauri-plugin-pinia` 持久化宠物状态
- 定期保存，避免数据丢失
- 支持数据迁移（版本升级时）

### 6.2 性能优化
- 状态轮询间隔保持 500ms
- 动画使用 CSS/requestAnimationFrame
- 避免频繁的 IPC 通信

### 6.3 跨平台兼容
- macOS: 完整支持
- Windows: 需测试权限和窗口行为
- Linux: 基础支持

---

## 七、设计参考

- **Tamagotchi**: 经典电子宠物的成长机制
- **Forest App**: 专注时间的游戏化设计
- **GitHub Contributions**: 活动热力图展示
- **Discord Nitro**: 等级和徽章系统

---

*最后更新: 2024-04*
