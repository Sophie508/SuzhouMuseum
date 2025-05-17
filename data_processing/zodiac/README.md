# 生肖藏品分析模块

这个模块用于分析博物馆藏品中与生肖相关的藏品，为用户生肖推荐功能提供数据支持。

## 功能介绍

1. **藏品分析**：分析藏品数据中与十二生肖相关的藏品，通过关键词匹配识别藏品与生肖的关联
2. **数据生成**：生成包含生肖相关藏品的JSON数据文件，供前端应用使用
3. **统计报告**：生成生肖相关藏品的统计报告，包括各生肖相关藏品数量、示例藏品等

## 目录结构

```
data_processing/zodiac/
├── README.md                 # 本文档
├── analyze_zodiac_artifacts.py  # 生肖藏品分析脚本
├── view_zodiac_stats.py      # 生肖藏品统计查看脚本
├── run_zodiac_analysis.sh    # 运行分析的Shell脚本
├── data/                     # 生成的数据文件存放目录
│   └── zodiac_artifacts.json # 生肖相关藏品数据
└── logs/                     # 日志文件目录
```

## 使用方法

### 运行分析

执行以下命令运行完整的分析流程：

```bash
bash data_processing/zodiac/run_zodiac_analysis.sh
```

这将：
1. 分析藏品数据中与生肖相关的藏品
2. 生成生肖相关藏品的JSON数据文件
3. 将数据复制到公共目录供前端使用
4. 显示简要的统计报告

### 查看详细统计

要查看更详细的统计信息，可以执行：

```bash
python data_processing/zodiac/view_zodiac_stats.py --examples 3
```

参数说明：
- `--input`：指定生肖相关藏品数据文件路径（默认为 `data_processing/zodiac/data/zodiac_artifacts.json`）
- `--examples`：每个生肖显示的示例藏品数量（默认为3）

### 单独运行分析脚本

如果只需要运行分析脚本而不执行完整流程，可以执行：

```bash
python data_processing/zodiac/analyze_zodiac_artifacts.py --input public/data/artifacts.json --output data_processing/zodiac/data/zodiac_artifacts.json
```

参数说明：
- `--input`：指定藏品数据JSON文件路径（默认为 `public/data/artifacts.json`）
- `--output`：指定生肖相关藏品输出JSON文件路径（默认为 `data_processing/zodiac/data/zodiac_artifacts.json`）

## 输出数据格式

生成的JSON数据文件包含以下内容：

```json
{
  "zodiacArtifacts": {
    "rat": ["1", "2", "3"],
    "ox": ["4", "5"],
    ...
  },
  "artifactsWithZodiac": [
    {
      "id": "1",
      "name": "藏品名称",
      "fullName": "完整名称",
      "period": "朝代",
      "image": "图片URL",
      "localImage": "本地图片路径",
      "zodiacs": ["rat"],
      "zodiacNames": ["鼠"]
    },
    ...
  ],
  "stats": {
    "totalArtifacts": 500,
    "totalZodiacArtifacts": 120,
    "countByZodiac": {
      "rat": 10,
      "ox": 12,
      ...
    }
  }
}
```

## 依赖项

- Python 3.6+
- pandas
- tqdm
- rich (用于美化控制台输出)

可以通过以下命令安装依赖：

```bash
pip install -r data_processing/requirements.txt
``` 