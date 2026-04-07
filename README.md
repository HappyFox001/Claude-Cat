<h1 style="border-bottom: none" align="center">
  Claude Cat
  <br />
  <p>你的桌面 AI 小伙伴</p>
</h1>

<div align="center">
  <blockquote>
    <em><strong>一只可爱的桌面宠物，实时映射你的 Claude Code 工作流</strong></em>
  </blockquote>
 </div>

<br>

![Claude Cat](/public/banner.png)

<p align="center">
  <em>一只会随 Claude Code 状态实时同步的可爱 Live2D 桌宠</em>
  <br>
  <em>献给希望用萌宠追踪 AI 辅助工作流的开发者</em>
</p>

<br>

<div align="center">
  <em><strong>编码、思考、庆祝——一切都由你的猫猫呈现</strong></em>
  </div>

<br>

## 快速开始

| 什么是 Claude Cat |
| :---------------- |

Claude Cat 是一款跨平台的桌面宠物应用，把一只 Live2D 猫猫带到你的屏幕上。不同于传统桌宠，它与 **Claude Code** 深度集成，通过丰富的表情与状态指示，实时反映你的 AI 开发工作流。

看它如何与你互动：

- 🤔 当 Claude 正在处理时进入思考
- 💻 当你编码时跟着敲键盘
- 🎉 任务完成时一起庆祝
- 😢 出错时做出反应
- 💤 空闲时安静休息

| 致谢 |
| :--- |

- 项目基于 [BongoCat](https://github.com/ayangweb/BongoCat) 和 [code-pet](https://github.com/Xiaooolong/code-pet) 二次开发 ，感谢两个伟大的项目陪伴了我无聊的 Vibe Coding 时光。

| 工作原理 |
| :------- |

Claude Cat 会监控 Claude Code 的状态文件（`~/.bongo-cat/status.json`），把 AI 活动转化为直观的可视化反馈：

**状态 → 表情映射**：

- `idle` → 正常 😺
- `thinking` → 思考/疑惑 🤔
- `coding` → 专注编码 💻
- `reading` → 阅读专注 📖
- `searching` → 好奇搜索 🔍
- `running_command` → 正在执行 ⚡
- `writing` → 创作书写 ✍️
- `success` → 成功/兴奋 🎉
- `error` → 难过/生气 😢😾
- `waiting_user` → 等待用户 👀
- `celebrate` → 超开心 🎊

同一状态可映射到多个表情（随机选择），更加生动有趣！

| 配置 |
| :--- |

**偏好设置**（按配置的快捷键或点击托盘图标）：

- 🐱 **猫猫设置**：窗口大小、透明度、置顶、悬停隐藏
- 🎭 **表情映射**：为每个 Claude 状态自定义表情
- ⌨️ **快捷键**：配置全局热键
- 🎨 **模型管理**：导入与切换 Live2D 模型
- 📊 **统计**：查看每日工作指标与分析
- 🌍 **语言**：切换界面语言

**状态文件设置**：
Claude Cat 会读取 `~/.bongo-cat/status.json`。请确保 Claude Code 已配置将状态更新写入该文件。

| 许可证 |
| :----- |

本项目以「MIT 许可证」发布。你可以自由地使用、复制、修改、合并、出版、分发、再许可及/或销售本软件的副本，但需在副本中包含版权与许可声明。

有关详情，请查阅仓库中的 `LICENSE` 文件。

---

<div align="center">
  <p><strong>由开发者用 ❤️ 打造，献给开发者</strong></p>
  <p><em>愿这只猫猫为你的每次编码增添乐趣</em></p>
</div>
