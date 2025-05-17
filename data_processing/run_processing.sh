#!/bin/bash

# 设置OpenAI API密钥
# 替换为你的实际API密钥
export OPENAI_API_KEY=your_api_key_here

# 创建输出目录
mkdir -p ../cleaned_data

# 获取主项目目录的路径
PROJECT_DIR="$(cd .. && pwd)"
CSV_FILE="${PROJECT_DIR}/data.csv"

echo "使用数据文件: ${CSV_FILE}"

# 1. 基础版本：使用简单逻辑生成问答题
# python3 process_collection_data.py --input "${CSV_FILE}" --output-dir ../cleaned_data

# 2. AI版本：使用OpenAI API生成问答题
# 如果要使用AI生成问答题，取消下面这行的注释，并确保设置了正确的API密钥
# python3 process_collection_data.py --input "${CSV_FILE}" --output-dir ../cleaned_data --use-ai

# 3. 测试版本：只处理少量数据进行测试
python3 process_collection_data.py --input "${CSV_FILE}" --output-dir ../cleaned_data --limit 5

echo "处理完成！输出文件保存在cleaned_data目录" 