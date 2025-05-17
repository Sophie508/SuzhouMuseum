#!/bin/bash

# 生肖相关藏品分析脚本
# 这个脚本用于分析博物馆藏品中与生肖相关的藏品，并生成相关的JSON数据文件

# 设置颜色输出
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# 创建日志目录
mkdir -p data_processing/logs

# 日志文件
LOG_FILE="data_processing/logs/zodiac_analysis_$(date +%Y%m%d_%H%M%S).log"

echo -e "${GREEN}开始分析生肖相关藏品...${NC}"
echo -e "${YELLOW}日志将保存到: ${LOG_FILE}${NC}"

# 运行Python脚本进行生肖分析
python data_processing/process_collection_data.py \
  --input public/data/artifacts.json \
  --output public/data/artifacts.json \
  --zodiac public/data/zodiac_artifacts.json \
  --skip-processing \
  --skip-quizzes \
  2>&1 | tee "$LOG_FILE"

# 检查是否成功
if [ $? -eq 0 ]; then
  echo -e "${GREEN}生肖相关藏品分析完成!${NC}"
  echo -e "${GREEN}结果已保存到: public/data/zodiac_artifacts.json${NC}"
else
  echo -e "${RED}生肖相关藏品分析失败，请查看日志文件获取详细信息${NC}"
  exit 1
fi

# 显示一些统计信息
echo -e "${GREEN}生肖相关藏品统计信息:${NC}"
cat public/data/zodiac_artifacts.json | grep -A 15 "\"stats\":"

echo -e "${GREEN}分析完成!${NC}" 