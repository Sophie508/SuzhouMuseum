#!/bin/bash

# 设置OpenAI API密钥
# 请将下面的占位符替换为你的实际API密钥
export OPENAI_API_KEY="YOUR_OPENAI_API_KEY_HERE"

# 获取主项目目录的路径
PROJECT_DIR="$(cd .. && pwd)"
CSV_FILE="${PROJECT_DIR}/data.csv"

echo "===== AI问答题生成器 ====="
echo "使用数据文件: ${data.csv}"

# 创建输出目录
mkdir -p ../cleaned_data_ai

# 只处理3个藏品作为测试
# 如果你想处理更多藏品，可以修改--limit参数
# 移除--limit参数可处理所有藏品
python3 process_collection_data.py \
  --input "${CSV_FILE}" \
  --output-dir ../cleaned_data_ai \
  --use-ai \

echo "===== 处理完成！====="
echo "输出文件保存在 ../cleaned_data_ai 目录" 