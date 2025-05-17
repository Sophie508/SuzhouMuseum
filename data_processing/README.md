# 苏州博物馆数据处理与导入工具

这个工具集用于处理苏州博物馆藏品数据，并将其导入到博物馆交互系统中。

## 功能概述

1. **数据清洗与转换**：将原始CSV数据转换为结构化的JSON格式
2. **问答题生成**：基于藏品数据自动生成问答题
3. **图片下载**：下载藏品图片并整理
4. **数据导入**：将处理后的数据导入到博物馆交互系统中

## 安装依赖

```bash
pip install -r requirements.txt
```

## 使用流程

### 1. 处理藏品数据

首先，我们需要将原始CSV数据转换为JSON格式：

```bash
python data_cleaner.py
```

这个脚本将：
- 读取`combined - combined.csv`文件
- 清洗和格式化数据
- 输出`cleaned_data/artifacts.json`和`cleaned_data/quizzes.json`文件

### 2. 下载藏品图片

接下来，下载所有藏品的图片：

```bash
python download_images.py --artifacts-file cleaned_data/artifacts.json --output-dir museum_images
```

这个脚本将：
- 读取处理后的藏品数据
- 下载所有藏品图片到`museum_images`目录
- 更新图片本地路径信息
- 输出`cleaned_data/artifacts.updated.json`文件

### 3. 导入数据到博物馆系统

最后，我们将处理后的数据导入到博物馆交互系统中：

```bash
python import_to_museum_system.py --museum-dir /path/to/museum/system --artifacts-file cleaned_data/artifacts.updated.json --quizzes-file cleaned_data/quizzes.json
```

这个脚本将：
- 验证博物馆系统目录结构
- 将藏品数据导入到系统中
- 将问答题数据导入到系统中
- 更新系统配置

## 数据格式说明

### 藏品数据格式

```json
{
  "artifacts": [
    {
      "id": "1",
      "name": "木经箱",
      "fullName": "【宋】木经箱",
      "period": "宋",
      "description": "1978年在瑞光寺塔第三层塔心的天宫中发现。木质，平面长方形，盝顶。系由十四块小板材榫接而成,外表髹红褐色漆，无纹饰。",
      "dimensions": "宋长 32.7 厘米 宽14.7厘米 高14厘米",
      "image": "https://file.szmuseum.com/WaterMark/文章管理缩略图/202102051618455X6gD0.jpg",
      "localImage": "museum_images/【宋】木经箱.jpg",
      "interestingFacts": "",
      "culturalContext": "",
      "location": "苏州博物馆"
    },
    // ... 更多藏品
  ]
}
```

### 问答题数据格式

```json
{
  "quizzes": [
    {
      "id": "quiz_1_1",
      "artifactId": "1",
      "question": "木经箱是哪个时期的藏品？",
      "options": [
        {"id": "a", "text": "宋"},
        {"id": "b", "text": "汉代"},
        {"id": "c", "text": "唐代"},
        {"id": "d", "text": "宋代"}
      ],
      "correctAnswer": "a",
      "explanation": "木经箱是宋时期的藏品。"
    },
    // ... 更多问题
  ]
}
```

## 注意事项

1. 确保原始CSV文件编码为UTF-8格式
2. 下载图片时请注意控制并发数，避免对源服务器造成压力
3. 导入到博物馆系统前，请确保系统目录结构正确
4. 建议在导入前备份原有数据

## 进阶使用

### 自定义问答题

如果您想自定义问答题，可以手动编辑`cleaned_data/quizzes.json`文件，或者修改`data_cleaner.py`中的`generate_quiz_data`函数。

### 添加更多藏品信息

如果您有藏品的附加信息，如"interestingFacts"或"culturalContext"，可以在`data_cleaner.py`文件中修改`process_collection_data`函数，或者在数据处理后手动编辑JSON文件。

### 自定义图片下载

如果您已经有本地图片，可以修改`download_images.py`脚本，跳过下载步骤，直接更新图片路径信息。 