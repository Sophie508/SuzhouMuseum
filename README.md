# 苏州博物馆藏品交互系统

## 开发环境设置

1. 安装依赖
```bash
npm install
# 或
pnpm install
```

2. 运行开发服务器
```bash
npm run dev
# 或
pnpm dev
```

## 数据导入指南

### 使用现有藏品和问答题数据

1. 将 `artifacts.json` 文件复制到 `public/data/` 目录
2. 将 `quizzes.json` 文件复制到 `public/data/` 目录
3. 将相关图片（如果有）复制到 `public/images/artifacts/` 目录

```bash
# 创建必要的目录
mkdir -p public/data
mkdir -p public/images/artifacts

# 复制JSON数据文件
cp /path/to/your/artifacts.json public/data/
cp /path/to/your/quizzes.json public/data/

# 复制图片（如果有）
cp /path/to/your/images/* public/images/artifacts/
```

### 生成新的问答题

1. 确保已经安装了Python环境和依赖库
```bash
cd data_processing
pip install -r requirements.txt
```

2. 使用增强问答题生成脚本
```bash
cd data_processing
./run_enhanced_quizzes.sh
```

3. 将生成的问答题导入系统
```bash
# 复制生成的问答题JSON文件
cp enhanced_quizzes/quizzes.json public/data/
```

## 数据更新指南

当系统开发完成后，你可以随时更新藏品和问答题数据，而不影响系统功能：

1. 生成或准备新的 `quizzes.json` 文件
2. 替换 `public/data/quizzes.json` 文件
3. 刷新网页即可加载新数据

```bash
# 替换问答题数据
cp /path/to/new/quizzes.json public/data/
```

### 注意事项

- 新数据格式必须与原始数据格式保持一致
- 如果藏品添加了新的ID，相应的问答题中的artifactId也应该对应更新
- 图片应该与artifacts.json中的路径一致

## 开发建议

1. 先使用小数据集（30-50题）完成系统功能开发和测试
2. 确认所有功能正常后，再导入完整的800+道题数据库
3. 如果图片加载失败，系统会自动使用占位图像 