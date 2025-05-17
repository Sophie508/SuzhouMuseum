#!/bin/bash

# 生肖相关藏品分析脚本
# 这个脚本用于分析博物馆藏品中与生肖相关的藏品，并生成相关的JSON数据文件

# 设置颜色输出
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# 创建必要的目录
mkdir -p data_processing/zodiac/data
mkdir -p data_processing/zodiac/logs

# 日志文件
LOG_FILE="data_processing/zodiac/logs/zodiac_analysis_$(date +%Y%m%d_%H%M%S).log"

echo -e "${GREEN}开始分析生肖相关藏品...${NC}"
echo -e "${YELLOW}日志将保存到: ${LOG_FILE}${NC}"

# 运行Python脚本进行生肖分析
python data_processing/zodiac/analyze_zodiac_artifacts.py \
  --input public/data/artifacts.json \
  --output data_processing/zodiac/data/zodiac_artifacts.json \
  2>&1 | tee "$LOG_FILE"

# 检查是否成功
if [ $? -eq 0 ]; then
  echo -e "${GREEN}生肖相关藏品分析完成!${NC}"
  echo -e "${GREEN}结果已保存到: data_processing/zodiac/data/zodiac_artifacts.json${NC}"
  
  # 复制结果到公共目录，以便前端使用
  echo -e "${YELLOW}正在复制结果到公共目录...${NC}"
  cp data_processing/zodiac/data/zodiac_artifacts.json public/data/
  echo -e "${GREEN}已复制到: public/data/zodiac_artifacts.json${NC}"
else
  echo -e "${RED}生肖相关藏品分析失败，请查看日志文件获取详细信息${NC}"
  exit 1
fi

# 显示统计信息
echo -e "${GREEN}正在生成统计报告...${NC}"
python data_processing/zodiac/view_zodiac_stats.py \
  --input data_processing/zodiac/data/zodiac_artifacts.json \
  --examples 2

echo -e "${GREEN}分析完成!${NC}"
echo -e "${YELLOW}你可以使用以下命令查看更详细的统计信息:${NC}"
echo -e "python data_processing/zodiac/view_zodiac_stats.py --examples 3" 