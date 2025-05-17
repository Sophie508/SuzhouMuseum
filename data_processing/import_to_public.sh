#!/bin/bash

# 设置颜色输出
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${GREEN}===== 苏州博物馆数据导入工具 =====${NC}"

# 获取项目根目录
PROJECT_DIR=$(cd .. && pwd)
# 处理路径中可能存在的空格
PROJECT_DIR_FIXED=$(echo "$PROJECT_DIR" | sed 's/ \//\//g')

# 创建必要的目录
mkdir -p "${PROJECT_DIR_FIXED}/public/data"
mkdir -p "${PROJECT_DIR_FIXED}/public/images/artifacts"

echo "创建目录结构..."

# 定位artifacts.json文件
ARTIFACTS_FILE=""
ARTIFACTS_CANDIDATES=(
  "${PROJECT_DIR_FIXED}/cleaned_data/artifacts.json"
  "${PROJECT_DIR_FIXED}/enhanced_quizzes/artifacts.json"
  "${PROJECT_DIR_FIXED}/data_processing/cleaned_data/artifacts.json"
)

for candidate in "${ARTIFACTS_CANDIDATES[@]}"; do
  if [[ -f "$candidate" ]]; then
    ARTIFACTS_FILE="$candidate"
    break
  fi
done

if [[ -z "$ARTIFACTS_FILE" ]]; then
  echo -e "${YELLOW}警告: 未找到默认位置的artifacts.json文件${NC}"
  read -p "请输入artifacts.json文件的路径: " ARTIFACTS_FILE
  
  if [[ ! -f "$ARTIFACTS_FILE" ]]; then
    echo -e "${RED}错误: 找不到指定的文件: $ARTIFACTS_FILE${NC}"
    exit 1
  fi
fi

# 定位quizzes.json文件
QUIZZES_FILE=""
QUIZZES_CANDIDATES=(
  "${PROJECT_DIR_FIXED}/enhanced_quizzes/quizzes.json"
  "${PROJECT_DIR_FIXED}/cleaned_data/quizzes.json"
  "${PROJECT_DIR_FIXED}/data_processing/enhanced_quizzes/quizzes.json"
)

for candidate in "${QUIZZES_CANDIDATES[@]}"; do
  if [[ -f "$candidate" ]]; then
    QUIZZES_FILE="$candidate"
    break
  fi
done

if [[ -z "$QUIZZES_FILE" ]]; then
  echo -e "${YELLOW}警告: 未找到默认位置的quizzes.json文件${NC}"
  read -p "请输入quizzes.json文件的路径: " QUIZZES_FILE
  
  if [[ ! -f "$QUIZZES_FILE" ]]; then
    echo -e "${RED}错误: 找不到指定的文件: $QUIZZES_FILE${NC}"
    exit 1
  fi
fi

# 复制文件到public/data目录
echo -e "${GREEN}正在复制文件...${NC}"
cp "$ARTIFACTS_FILE" "${PROJECT_DIR_FIXED}/public/data/artifacts.json"
cp "$QUIZZES_FILE" "${PROJECT_DIR_FIXED}/public/data/quizzes.json"

echo -e "${GREEN}数据文件导入成功!${NC}"
echo "artifacts.json: $ARTIFACTS_FILE → ${PROJECT_DIR_FIXED}/public/data/artifacts.json"
echo "quizzes.json: $QUIZZES_FILE → ${PROJECT_DIR_FIXED}/public/data/quizzes.json"

# 检查是否需要复制图片
read -p "是否要复制图片文件? (y/n): " COPY_IMAGES

if [[ "$COPY_IMAGES" == "y" || "$COPY_IMAGES" == "Y" ]]; then
  # 查找可能的图片目录
  IMAGE_DIR=""
  IMAGE_CANDIDATES=(
    "${PROJECT_DIR_FIXED}/images"
    "${PROJECT_DIR_FIXED}/cleaned_data/images"
    "${PROJECT_DIR_FIXED}/data_processing/images"
  )
  
  for candidate in "${IMAGE_CANDIDATES[@]}"; do
    if [[ -d "$candidate" ]]; then
      IMAGE_DIR="$candidate"
      break
    fi
  done
  
  if [[ -z "$IMAGE_DIR" ]]; then
    echo -e "${YELLOW}警告: 未找到默认的图片目录${NC}"
    read -p "请输入图片文件所在的目录: " IMAGE_DIR
    
    if [[ ! -d "$IMAGE_DIR" ]]; then
      echo -e "${RED}错误: 找不到指定的目录: $IMAGE_DIR${NC}"
      exit 1
    fi
  fi
  
  # 复制图片文件
  echo -e "${GREEN}正在复制图片文件...${NC}"
  cp -r "$IMAGE_DIR"/* "${PROJECT_DIR_FIXED}/public/images/artifacts/"
  echo -e "${GREEN}图片文件复制完成!${NC}"
fi

echo -e "${GREEN}===== 导入完成 =====${NC}"
echo "您现在可以启动Web应用来查看导入的数据:"
echo "cd ${PROJECT_DIR_FIXED}"
echo "npm run dev"
echo -e "${YELLOW}提示: 如果图片无法显示，将使用默认占位图${NC}" 