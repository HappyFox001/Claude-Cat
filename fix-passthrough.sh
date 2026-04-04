#!/bin/bash
# 快速关闭 BongoCat 的透视模式

CONFIG_PATH="$HOME/Library/Application Support/com.ayangweb.BongoCat/tauri-plugin-pinia/cat.dev.json"

echo "正在关闭透视模式..."

# 使用 sed 修改配置文件
sed -i '' 's/"passThrough":true/"passThrough":false/g' "$CONFIG_PATH"
sed -i '' 's/"visible":false/"visible":true/g' "$CONFIG_PATH"

echo "✅ 透视模式已关闭，窗口已显示"
echo "请重启应用以应用更改"
