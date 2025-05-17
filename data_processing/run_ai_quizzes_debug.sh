#!/bin/bash

# 设置日志文件
LOG_FILE="../ai_quizzes_debug.log"

# 清空之前的日志
echo "========= AI问答题生成器 (DEBUG模式) =========" > $LOG_FILE

# 设置OpenAI API密钥
# 请将下面的占位符替换为你的实际API密钥
export OPENAI_API_KEY="YOUR_OPENAI_API_KEY_HERE"

# 设置环境变量以禁用SSL验证
export NODE_TLS_REJECT_UNAUTHORIZED=0
export SSL_CERT_DIR=""
export SSL_CERT_FILE=""

echo "已设置环境变量以禁用SSL验证" | tee -a $LOG_FILE

# 获取主项目目录的路径
PROJECT_DIR="$(cd .. && pwd)"
CSV_FILE="${PROJECT_DIR}/data.csv"

echo "使用数据文件: ${CSV_FILE}" | tee -a $LOG_FILE

# 创建输出目录
mkdir -p ../cleaned_data_ai_debug

# 只处理1个藏品作为测试
# 这样可以更快地确认问题所在
python3 process_collection_data.py \
  --input "${CSV_FILE}" \
  --output-dir ../cleaned_data_ai_debug \
  --use-ai \
  --limit 1 \
  2>&1 | tee -a $LOG_FILE

echo "===== 处理完成！=====" | tee -a $LOG_FILE
echo "输出文件保存在 ../cleaned_data_ai_debug 目录" | tee -a $LOG_FILE
echo "日志文件保存在 $LOG_FILE" | tee -a $LOG_FILE 