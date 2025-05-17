import pandas as pd
import json
import re
import os
import argparse
from pathlib import Path
from tqdm import tqdm
import openai
from dotenv import load_dotenv
import ssl
import certifi
import httpx
import random

# 加载环境变量
load_dotenv()

def clean_text(text):
    """清理文本，移除不必要的空格和特殊字符"""
    if pd.isna(text):
        return ""
    return str(text).strip()

def extract_period_from_name(name):
    """从名称中提取时期信息"""
    if pd.isna(name):
        return ""
    
    match = re.search(r'【(.*?)】', name)
    if match:
        return match.group(1)
    return ""

def process_collection_data(input_file, output_file):
    """处理藏品数据并转换为JSON格式"""
    print(f"正在处理藏品数据: {input_file}")
    
    # 读取CSV文件
    df = pd.read_csv(input_file)
    
    # 清理数据
    df = df.fillna("")
    
    # 构建藏品数据
    artifacts = []
    
    for idx, row in tqdm(df.iterrows(), total=len(df), desc="处理藏品"):
        if not row['名称'] or pd.isna(row['名称']):
            continue
            
        # 提取时期
        period = extract_period_from_name(row['名称'])
        
        # 从名称中移除时期信息以得到干净的名称
        clean_name = row['名称'].replace(f"【{period}】", "").strip() if period else row['名称']
        
        # 构建藏品对象
        artifact = {
            "id": str(idx + 1),  # 为每个藏品生成唯一ID
            "name": clean_name,
            "fullName": row['名称'],
            "period": period,
            "description": clean_text(row['简介']),
            "dimensions": clean_text(row['尺寸信息']),
            "image": clean_text(row['图片URL']),
            "localImage": clean_text(row['本地图片路径']),
            "interestingFacts": "",  # 这些字段可以后续手动添加或从描述中提取
            "culturalContext": "",
            "location": "苏州博物馆"  # 默认位置
        }
        
        # 将藏品添加到列表
        artifacts.append(artifact)
    
    # 构建最终的JSON结构
    collection_data = {
        "artifacts": artifacts
    }
    
    # 保存为JSON文件
    with open(output_file, 'w', encoding='utf-8') as f:
        json.dump(collection_data, f, ensure_ascii=False, indent=2)
    
    print(f"处理完成，已保存到: {output_file}")
    print(f"总共处理了 {len(artifacts)} 件藏品")
    
    return collection_data

def generate_quiz_with_ai(artifact, api_key=None):
    """使用OpenAI API为藏品生成更智能的问答题"""
    # 优先使用传入的API密钥，其次使用环境变量中的密钥
    if api_key:
        openai.api_key = api_key
    else:
        # 从环境变量获取API密钥
        openai.api_key = os.getenv("OPENAI_API_KEY")
    
    if not openai.api_key:
        print("未提供OpenAI API密钥，无法生成AI问答题")
        return []
    
    print(f"开始为藏品 '{artifact['name']}' 生成AI问答题...")
    
    # 构建提示词 - 修改为只生成一个问题
    prompt = """
    你是一位专业的博物馆教育专家和文物研究员，需要根据博物馆藏品信息创建高质量的多选题问答。请基于以下苏州博物馆藏品信息，创建1个准确、教育性强且有深度的多选题问答：

    【藏品信息】
    名称：""" + artifact['name'] + """
    全称：""" + artifact['fullName'] + """
    时期：""" + artifact['period'] + """
    描述：""" + artifact['description'] + """
    尺寸：""" + artifact['dimensions'] + """
    
    【创建要求】
    1. 问题类型：关于藏品历史背景、时代特征、材质、工艺或艺术特点的最富教育意义的问题
    2. 问题难度：中等，适合博物馆参观者和文化爱好者
    3. 选项设计：
       - 所有选项必须合理、有说服力，不要出现明显不合理的选项
       - 错误选项应基于常见误解或相似概念，具有一定迷惑性
       - 正确答案必须准确无误，严格基于提供的藏品信息
    4. 答案解释：解释应详细且具有教育意义，可包含额外的相关历史或文化背景知识
    
    【输出格式】
    请严格按照以下JSON格式输出：
    {
      "quizzes": [
        {
          "question": "关于[藏品名称]的详细问题",
          "options": [
            {"id": "a", "text": "选项A详细内容"},
            {"id": "b", "text": "选项B详细内容"},
            {"id": "c", "text": "选项C详细内容"},
            {"id": "d", "text": "选项D详细内容"}
          ],
          "correctAnswer": "正确选项ID",
          "explanation": "详细的解释，包含教育信息和背景知识"
        }
      ]
    }
    """
    
    try:
        print(f"调用OpenAI API...")
        # 调用OpenAI API - 使用最新的API格式
        client = openai.OpenAI(api_key=openai.api_key)
        response = client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[{"role": "user", "content": prompt}],
            temperature=0.7
        )
        
        # 解析结果
        result_text = response.choices[0].message.content
        print(f"API响应内容: {result_text[:100]}...")  # 打印前100个字符以便调试
        
        # 清理响应文本，移除可能的markdown代码块标记
        result_text = result_text.replace('```json', '').replace('```', '').strip()
        
        result = json.loads(result_text)
        print(f"成功解析JSON结果，获取到 {len(result.get('quizzes', []))} 个问答题")
        
        # 添加artifactId和id
        for i, quiz in enumerate(result.get("quizzes", [])):
            quiz["artifactId"] = artifact["id"]
            quiz["id"] = f"quiz_{artifact['id']}_{i+1}"
        
        return result.get("quizzes", [])
    except json.JSONDecodeError as e:
        print(f"JSON解析错误: {e}")
        print(f"API返回的原始文本: {result_text}")
        return []
    except Exception as e:
        print(f"生成藏品 '{artifact['name']}' 的问答题时出错: {e}")
        import traceback
        traceback.print_exc()
        return []

def generate_quiz_data(collection_data, output_file, use_ai=False, api_key=None, limit=None):
    """为每个藏品生成问答题数据"""
    print("正在生成问答题数据...")
    
    quizzes = []
    
    # 如果设置了limit，只处理指定数量的藏品
    artifacts_to_process = collection_data["artifacts"]
    if limit and limit > 0 and limit < len(artifacts_to_process):
        artifacts_to_process = artifacts_to_process[:limit]
        print(f"限制处理前 {limit} 件藏品")
    
    # 检查是否使用AI生成问答题
    if use_ai:
        # 使用AI生成问答题 - 每个藏品一个问题
        for artifact in tqdm(artifacts_to_process, desc="生成问答题"):
            if artifact["description"]:
                ai_quizzes = generate_quiz_with_ai(artifact, api_key)
                quizzes.extend(ai_quizzes)
    else:
        # 使用原来的简单逻辑生成问答题 - 每个藏品一个问题
        for artifact in tqdm(artifacts_to_process, desc="生成问答题"):
            # 为每个藏品只生成一个问题
            if artifact["description"]:
                # 问题: 关于藏品时期或特征，根据描述随机选择
                if len(artifact["description"]) > 20 and random.random() > 0.5:
                    # 从描述中提取一个特征作为问题
                    description = artifact["description"]
                    quiz = {
                        "id": f"quiz_{artifact['id']}_1",
                        "artifactId": artifact["id"],
                        "question": f"关于{artifact['name']}，以下哪一项描述是正确的？",
                        "options": [
                            {"id": "a", "text": description[:min(50, len(description))] + "..."},
                            {"id": "b", "text": "由黄金制成"},
                            {"id": "c", "text": "产自西域"},
                            {"id": "d", "text": "为皇家专用器物"}
                        ],
                        "correctAnswer": "a",
                        "explanation": f"正确描述：{description}"
                    }
                else:
                    # 关于藏品时期的问题
                    quiz = {
                        "id": f"quiz_{artifact['id']}_1",
                        "artifactId": artifact["id"],
                        "question": f"{artifact['name']}是哪个时期的藏品？",
                        "options": [
                            {"id": "a", "text": f"{artifact['period']}"},
                            {"id": "b", "text": "汉代"},
                            {"id": "c", "text": "唐代"},
                            {"id": "d", "text": "宋代"}
                        ],
                        "correctAnswer": "a",
                        "explanation": f"{artifact['name']}是{artifact['period']}时期的藏品。"
                    }
                quizzes.append(quiz)
    
    # 构建最终的JSON结构
    quiz_data = {
        "quizzes": quizzes
    }
    
    # 保存为JSON文件
    with open(output_file, 'w', encoding='utf-8') as f:
        json.dump(quiz_data, f, ensure_ascii=False, indent=2)
    
    print(f"问答题生成完成，已保存到: {output_file}")
    print(f"总共生成了 {len(quizzes)} 道题目")
    
    return quiz_data

if __name__ == "__main__":
    # 解析命令行参数
    parser = argparse.ArgumentParser(description="生成博物馆藏品问答题")
    parser.add_argument("--input", help="输入artifacts.json文件路径")
    parser.add_argument("--output-dir", default="cleaned_data", help="输出目录")
    parser.add_argument("--use-ai", action="store_true", help="是否使用AI生成问答题")
    parser.add_argument("--api-key", help="OpenAI API密钥")
    parser.add_argument("--limit", type=int, help="限制处理的藏品数量，用于测试")
    
    args = parser.parse_args()
    
    # 创建输出目录
    output_dir = Path(args.output_dir)
    output_dir.mkdir(exist_ok=True)
    
    # 读取藏品数据
    try:
        with open(args.input, 'r', encoding='utf-8') as f:
            collection_data = json.load(f)
        print(f"已读取藏品数据: {args.input}")
        print(f"总共读取了 {len(collection_data.get('artifacts', []))} 件藏品")
    except FileNotFoundError:
        print(f"错误: 找不到藏品文件 {args.input}")
        exit(1)
    except json.JSONDecodeError:
        print(f"错误: 藏品文件 {args.input} 不是有效的JSON格式")
        exit(1)
    
    # 生成问答题数据
    generate_quiz_data(
        collection_data,
        output_dir / "quizzes.json",
        use_ai=args.use_ai,
        api_key=args.api_key,
        limit=args.limit
    ) 