#!/usr/bin/env python3

import json
import argparse
import os
from pathlib import Path
from tqdm import tqdm
import openai
import time
from dotenv import load_dotenv

# 加载环境变量
load_dotenv()

# 生肖与相关关键词映射
ZODIAC_KEYWORDS = {
    'rat': ['鼠', '老鼠', '子鼠', '鼠形', '鼠饰', '鼠纹', '鼠耳', '鼠尾', '鼠首'],
    'ox': ['牛', '水牛', '丑牛', '牛形', '牛饰', '牛纹', '牛角', '牛首', '牛尾', '牦牛', '黄牛'],
    'tiger': ['虎', '老虎', '寅虎', '虎形', '虎饰', '虎纹', '虎皮', '虎爪', '虎头', '虎尾', '白虎'],
    'rabbit': ['兔', '兔子', '卯兔', '兔形', '兔饰', '兔纹', '兔耳', '兔尾', '兔首', '玉兔'],
    'dragon': ['龙', '辰龙', '龙形', '龙饰', '龙纹', '龙爪', '龙头', '龙尾', '龙凤', '祥龙', '神龙', '飞龙', '盘龙'],
    'snake': ['蛇', '巳蛇', '蛇形', '蛇饰', '蛇纹', '蛇皮', '蛇首', '蛇尾', '青蛇', '白蛇', '长蛇'],
    'horse': ['马', '午马', '马形', '马饰', '马纹', '马蹄', '马首', '马尾', '骏马', '神马', '天马', '骑马', '战马'],
    'goat': ['羊', '未羊', '山羊', '羊形', '羊饰', '羊纹', '羊角', '羊首', '羊尾', '绵羊', '羔羊'],
    'monkey': ['猴', '申猴', '猴子', '猴形', '猴饰', '猴纹', '猴爪', '猴首', '猴尾', '灵猴', '金猴'],
    'rooster': ['鸡', '酉鸡', '公鸡', '母鸡', '鸡形', '鸡饰', '鸡纹', '鸡冠', '鸡首', '鸡尾', '斗鸡', '金鸡'],
    'dog': ['狗', '戌狗', '犬', '狗形', '狗饰', '狗纹', '狗爪', '狗首', '狗尾', '猎犬', '獒犬', '灵犬'],
    'pig': ['猪', '亥猪', '野猪', '猪形', '猪饰', '猪纹', '猪首', '猪尾', '猪鬃', '家猪', '小猪']
}

# 生肖的中文名称
ZODIAC_CHINESE_NAMES = {
    'rat': '鼠',
    'ox': '牛',
    'tiger': '虎',
    'rabbit': '兔',
    'dragon': '龙',
    'snake': '蛇',
    'horse': '马',
    'goat': '羊',
    'monkey': '猴',
    'rooster': '鸡',
    'dog': '狗',
    'pig': '猪'
}

# 获取API密钥
def get_openai_api_key():
    api_key = os.getenv("OPENAI_API_KEY")
    if not api_key:
        raise ValueError("未找到OPENAI_API_KEY环境变量，请设置API密钥")
    return api_key

# 使用GPT分析藏品与生肖的关系
def analyze_artifact_with_gpt(artifact, client):
    """使用GPT分析藏品与生肖的关系"""
    # 构建藏品信息文本
    artifact_info = f"""
藏品名称: {artifact.get('name', '')}
完整名称: {artifact.get('fullName', '')}
朝代: {artifact.get('period', '')}
描述: {artifact.get('description', '')}
尺寸信息: {artifact.get('dimensions', '')}
文化背景: {artifact.get('culturalContext', '')}
有趣事实: {artifact.get('interestingFacts', '')}
"""

    # 构建严格且简洁的prompt
    prompt = f"""请分析以下博物馆藏品是否与中国十二生肖（鼠、牛、虎、兔、龙、蛇、马、羊、猴、鸡、狗、猪）有直接关联。

藏品信息:
{artifact_info}

请仅考虑以下情况为与生肖相关:
1. 藏品直接描绘或雕刻了生肖动物形象
2. 藏品名称明确提及生肖动物
3. 藏品主题或核心装饰元素是生肖动物
4. 藏品是为特定生肖年制作的纪念物

不要考虑以下情况:
1. 藏品描述中仅偶然提及动物名称
2. 藏品中动物只是次要装饰元素
3. 动物名称出现在人名、地名或其他专有名词中
4. 藏品与动物的关联过于牵强或模糊

请以JSON格式回答，包含以下字段:
1. "related_zodiacs": 与藏品相关的生肖列表(使用英文: rat, ox, tiger, rabbit, dragon, snake, horse, goat, monkey, rooster, dog, pig)，如无相关生肖则为空列表
2. "confidence": 确信度(0-1之间的小数)
3. "reasoning": 简短的分析理由(不超过100字)

只返回JSON格式，不要有任何其他文字。
"""

    try:
        # 调用GPT API
        response = client.chat.completions.create(
            model="gpt-4o-mini",  # 或者使用其他可用模型
            messages=[{"role": "user", "content": prompt}],
            temperature=0.1,  # 低温度以获得更确定的回答
            response_format={"type": "json_object"}
        )
        
        # 解析响应
        result = json.loads(response.choices[0].message.content)
        return result
    except Exception as e:
        print(f"分析藏品 '{artifact.get('name', '')}' 时出错: {e}")
        return {"related_zodiacs": [], "confidence": 0, "reasoning": f"分析失败: {str(e)}"}

def analyze_zodiac_artifacts(artifacts, output_file, api_key=None, confidence_threshold=0.7, batch_size=10):
    """分析藏品数据，标记与生肖相关的藏品"""
    print("正在分析与生肖相关的藏品...")
    
    # 初始化OpenAI客户端
    if not api_key:
        api_key = get_openai_api_key()
    
    client = openai.OpenAI(api_key=api_key)
    
    # 初始化结果字典
    zodiac_artifacts = {zodiac: [] for zodiac in ZODIAC_CHINESE_NAMES.keys()}
    artifacts_with_zodiac = []
    
    # 分批处理藏品
    total_batches = (len(artifacts) + batch_size - 1) // batch_size
    
    for batch_idx in tqdm(range(total_batches), desc="处理藏品批次"):
        start_idx = batch_idx * batch_size
        end_idx = min(start_idx + batch_size, len(artifacts))
        current_batch = artifacts[start_idx:end_idx]
        
        for artifact in tqdm(current_batch, desc=f"批次 {batch_idx+1}/{total_batches} 分析", leave=False):
            # 使用GPT分析藏品
            analysis_result = analyze_artifact_with_gpt(artifact, client)
            
            # 检查置信度
            if analysis_result.get("confidence", 0) >= confidence_threshold:
                related_zodiacs = analysis_result.get("related_zodiacs", [])
                
                # 如果有相关生肖
                if related_zodiacs:
                    # 添加到结果
                    for zodiac in related_zodiacs:
                        if zodiac in ZODIAC_CHINESE_NAMES:
                            zodiac_artifacts[zodiac].append(artifact["id"])
                    
                    # 添加到生肖相关藏品列表
                    artifacts_with_zodiac.append({
                        "id": artifact["id"],
                        "name": artifact["name"],
                        "fullName": artifact.get("fullName", ""),
                        "period": artifact.get("period", ""),
                        "image": artifact.get("image", ""),
                        "localImage": artifact.get("localImage", ""),
                        "zodiacs": related_zodiacs,
                        "zodiacNames": [ZODIAC_CHINESE_NAMES[z] for z in related_zodiacs if z in ZODIAC_CHINESE_NAMES],
                        "confidence": analysis_result.get("confidence", 0),
                        "reasoning": analysis_result.get("reasoning", "")
                    })
            
            # 避免API速率限制
            time.sleep(0.5)
    
    # 去除重复的ID
    for zodiac in zodiac_artifacts:
        zodiac_artifacts[zodiac] = list(set(zodiac_artifacts[zodiac]))
    
    # 构建结果数据
    result = {
        "zodiacArtifacts": zodiac_artifacts,
        "artifactsWithZodiac": artifacts_with_zodiac,
        "stats": {
            "totalArtifacts": len(artifacts),
            "totalZodiacArtifacts": len(artifacts_with_zodiac),
            "countByZodiac": {zodiac: len(ids) for zodiac, ids in zodiac_artifacts.items()}
        }
    }
    
    # 创建输出目录（如果不存在）
    os.makedirs(os.path.dirname(output_file), exist_ok=True)
    
    # 保存为JSON文件
    with open(output_file, 'w', encoding='utf-8') as f:
        json.dump(result, f, ensure_ascii=False, indent=2)
    
    print(f"生肖相关藏品分析完成，已保存到: {output_file}")
    print(f"统计信息:")
    print(f"  - 总藏品数: {result['stats']['totalArtifacts']}")
    print(f"  - 生肖相关藏品数: {result['stats']['totalZodiacArtifacts']}")
    print(f"  - 各生肖相关藏品数:")
    for zodiac, count in result['stats']['countByZodiac'].items():
        print(f"    - {ZODIAC_CHINESE_NAMES[zodiac]}: {count}件")
    
    return result

def main():
    parser = argparse.ArgumentParser(description="分析博物馆藏品中与生肖相关的藏品")
    parser.add_argument("--input", default="public/data/artifacts.json", help="藏品数据JSON文件路径")
    parser.add_argument("--output", default="data_processing/zodiac/data/zodiac_artifacts.json", help="生肖相关藏品输出JSON文件路径")
    parser.add_argument("--api-key", help="OpenAI API密钥，如不提供则从环境变量获取")
    parser.add_argument("--confidence", type=float, default=0.7, help="置信度阈值，默认为0.7")
    parser.add_argument("--batch-size", type=int, default=10, help="批处理大小，默认为10")
    parser.add_argument("--sample", type=int, help="仅分析指定数量的样本藏品（用于测试）")
    
    args = parser.parse_args()
    
    # 检查输入文件是否存在
    if not os.path.exists(args.input):
        print(f"错误: 找不到输入文件 {args.input}")
        return
    
    # 加载藏品数据
    try:
        with open(args.input, 'r', encoding='utf-8') as f:
            data = json.load(f)
        artifacts = data.get("artifacts", [])
        print(f"成功加载藏品数据，共 {len(artifacts)} 件藏品")
        
        # 如果指定了样本数量
        if args.sample and args.sample > 0 and args.sample < len(artifacts):
            import random
            artifacts = random.sample(artifacts, args.sample)
            print(f"随机选择 {args.sample} 件藏品进行分析（测试模式）")
            
    except Exception as e:
        print(f"加载藏品数据失败: {e}")
        return
    
    # 分析生肖相关藏品
    analyze_zodiac_artifacts(
        artifacts, 
        args.output, 
        api_key=args.api_key, 
        confidence_threshold=args.confidence,
        batch_size=args.batch_size
    )

if __name__ == "__main__":
    main() 