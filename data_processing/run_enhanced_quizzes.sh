#!/bin/bash

# 设置环境
set -e
echo "===== 高效博物馆问答题生成器 ====="

# 创建日志目录（改为当前目录下的相对路径）
LOG_DIR="./logs"
mkdir -p $LOG_DIR
LOG_FILE="${LOG_DIR}/enhanced_quizzes_$(date '+%Y%m%d_%H%M%S').log"

# 设置OpenAI API密钥
export OPENAI_API_KEY="YOUR_OPENAI_API_KEY_HERE"

# 设置环境变量以禁用SSL验证（解决之前的SSL错误）
export NODE_TLS_REJECT_UNAUTHORIZED=0
export SSL_CERT_DIR=""
export SSL_CERT_FILE=""

# 获取主项目目录的路径
PROJECT_DIR=$(cd .. && pwd)
# 移除路径中可能存在的空格问题
PROJECT_DIR_FIXED=$(echo "$PROJECT_DIR" | sed 's/ \//\//g')

# 查找artifacts.json文件
ARTIFACTS_FILE="${PROJECT_DIR_FIXED}/cleaned_data/artifacts.json"

# 如果指定位置找不到artifacts.json文件，尝试在项目目录中搜索它
if [ ! -f "$ARTIFACTS_FILE" ]; then
    echo "警告: 找不到藏品数据文件: $ARTIFACTS_FILE" | tee -a $LOG_FILE
    echo "尝试查找藏品数据文件..." | tee -a $LOG_FILE
    
    # 在项目目录中搜索artifacts.json文件
    FOUND_ARTIFACTS=$(find "$PROJECT_DIR_FIXED" -name "artifacts.json" -type f | head -n 1)
    
    if [ -n "$FOUND_ARTIFACTS" ]; then
        ARTIFACTS_FILE="$FOUND_ARTIFACTS"
        echo "找到藏品数据文件: $ARTIFACTS_FILE" | tee -a $LOG_FILE
    else
        echo "错误: 无法找到藏品数据文件。请确保artifacts.json文件存在。" | tee -a $LOG_FILE
        exit 1
    fi
fi

echo "使用藏品数据文件: ${ARTIFACTS_FILE}" | tee -a $LOG_FILE

# 输出目录
OUTPUT_DIR="../enhanced_quizzes"
mkdir -p $OUTPUT_DIR
echo "输出将保存至: $OUTPUT_DIR" | tee -a $LOG_FILE

# 运行处理脚本，生成高质量问答题
# 设置为处理更多藏品，因为每个藏品只生成一个问题，这样可以加快处理速度
python3 process_collection_data.py \
  --input "${ARTIFACTS_FILE}" \
  --output-dir $OUTPUT_DIR \
  --use-ai \
  --limit 30 \
  2>&1 | tee -a $LOG_FILE

echo "===== 处理完成 =====" | tee -a $LOG_FILE
echo "生成的问答题数据已保存至: ${OUTPUT_DIR}/quizzes.json" | tee -a $LOG_FILE
echo "日志文件保存在: $LOG_FILE" | tee -a $LOG_FILE

# 输出生成的问题数量
if [ -f "${OUTPUT_DIR}/quizzes.json" ]; then
  QUIZ_COUNT=$(python3 -c "import json; f=open('${OUTPUT_DIR}/quizzes.json'); data=json.load(f); print(len(data.get('quizzes', [])))" 2>&1)
  echo "成功生成 $QUIZ_COUNT 个高质量问答题" | tee -a $LOG_FILE
else
  echo "警告: 未找到 quizzes.json 文件，可能生成失败" | tee -a $LOG_FILE
fi 