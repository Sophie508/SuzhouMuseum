import pandas as pd
import json
import re
import os
import sys
import argparse
import traceback
from pathlib import Path
from tqdm import tqdm
import openai
from dotenv import load_dotenv

# 配置详细日志记录
import logging
logging.basicConfig(
    level=logging.DEBUG,
    format='%(asctime)s - %(levelname)s - %(message)s',
    handlers=[
        logging.StreamHandler(sys.stdout)
    ]
)
logger = logging.getLogger(__name__)

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
    logger.info(f"正在处理藏品数据: {input_file}")
    
    try:
        # 读取CSV文件
        logger.debug(f"尝试读取CSV文件: {input_file}")
        df = pd.read_csv(input_file)
        logger.info(f"成功读取CSV文件，共 {len(df)} 行数据")
    except Exception as e:
        logger.error(f"读取CSV文件失败: {e}")
        traceback.print_exc()
        return {"artifacts": []}
    
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
    try:
        with open(output_file, 'w', encoding='utf-8') as f:
            json.dump(collection_data, f, ensure_ascii=False, indent=2)
        logger.info(f"处理完成，已保存到: {output_file}")
        logger.info(f"总共处理了 {len(artifacts)} 件藏品")
    except Exception as e:
        logger.error(f"保存JSON文件失败: {e}")
        traceback.print_exc()
    
    return collection_data

def test_openai_connection():
    """测试OpenAI API连接是否正常"""
    logger.info("测试OpenAI API连接...")
    
    api_key = os.getenv("OPENAI_API_KEY")
    if not api_key:
        logger.error("未设置OPENAI_API_KEY环境变量")
        return False
    
    logger.debug(f"API密钥前10个字符: {api_key[:10]}...")
    
    try:
        openai.api_key = api_key
        response = openai.chat.completions.create(
            model="gpt-4o-mini",
            messages=[{"role": "user", "content": "简单的测试信息"}],
            max_tokens=10
        )
        logger.info(f"OpenAI API连接测试成功: {response.model}")
        return True
    except Exception as e:
        logger.error(f"OpenAI API连接测试失败: {e}")
        traceback.print_exc()
        return False

def generate_quiz_with_ai(artifact, api_key=None):
    """使用OpenAI API为藏品生成更智能的问答题"""
    logger.info(f"为藏品 '{artifact['name']}' 生成AI问答题...")
    
    # 优先使用传入的API密钥，其次使用环境变量中的密钥
    if api_key:
        openai.api_key = api_key
        logger.debug("使用传入的API密钥")
    else:
        # 从环境变量获取API密钥
        openai.api_key = os.getenv("OPENAI_API_KEY")
        logger.debug("使用环境变量中的API密钥")
    
    if not openai.api_key:
        logger.error("未提供OpenAI API密钥，无法生成AI问答题")
        return []
    
    # 检查传入的藏品数据
    if not artifact.get("description"):
        logger.warning(f"藏品 '{artifact['name']}' 缺少描述信息，跳过生成问答题")
        return []
    
    # 构建提示词
    prompt = f"""
    根据以下藏品信息，生成2个有趣且有教育意义的多选题问答（每题4个选项）：
    
    藏品名称：{artifact['name']}
    时期：{artifact['period']}
    描述：{artifact['description']}
    尺寸：{artifact['dimensions']}
    
    返回JSON格式如下：
    {{
      "quizzes": [
        {{
          "question": "问题1",
          "options": [
            {{"id": "a", "text": "选项A"}},
            {{"id": "b", "text": "选项B"}},
            {{"id": "c", "text": "选项C"}},
            {{"id": "d", "text": "选项D"}}
          ],
          "correctAnswer": "a",
          "explanation": "解释"
        }},
        {{
          "question": "问题2",
          "options": [
            {{"id": "a", "text": "选项A"}},
            {{"id": "b", "text": "选项B"}},
            {{"id": "c", "text": "选项C"}},
            {{"id": "d", "text": "选项D"}}
          ],
          "correctAnswer": "b",
          "explanation": "解释"
        }}
      ]
    }}
    """
    
    logger.debug(f"提示词前100个字符: {prompt[:100]}...")
    
    try:
        # 调用OpenAI API
        logger.info("调用OpenAI API...")
        response = openai.chat.completions.create(
            model="gpt-4o-mini",
            messages=[{"role": "user", "content": prompt}],
            temperature=0.7
        )
        
        # 获取结果
        result_text = response.choices[0].message.content
        logger.debug(f"API响应内容前100个字符: {result_text[:100]}...")
        
        # 解析JSON
        try:
            logger.debug("尝试解析JSON结果...")
            result = json.loads(result_text)
            quizzes = result.get("quizzes", [])
            logger.info(f"成功解析JSON结果，获取到 {len(quizzes)} 个问答题")
            
            # 添加artifactId和id
            for i, quiz in enumerate(quizzes):
                quiz["artifactId"] = artifact["id"]
                quiz["id"] = f"quiz_{artifact['id']}_{i+1}"
            
            return quizzes
        except json.JSONDecodeError as e:
            logger.error(f"JSON解析错误: {e}")
            logger.error(f"API返回的原始文本: {result_text}")
            return []
    except Exception as e:
        logger.error(f"生成藏品 '{artifact['name']}' 的问答题时出错: {e}")
        traceback.print_exc()
        return []

def generate_quiz_data(collection_data, output_file, use_ai=False, api_key=None, limit=None):
    """为每个藏品生成问答题数据"""
    logger.info("正在生成问答题数据...")
    
    # 检查collection_data的格式
    if not isinstance(collection_data, dict) or "artifacts" not in collection_data:
        logger.error("无效的藏品数据格式")
        return {"quizzes": []}
    
    quizzes = []
    
    # 如果设置了limit，只处理指定数量的藏品
    artifacts_to_process = collection_data["artifacts"]
    if limit and limit > 0 and limit < len(artifacts_to_process):
        artifacts_to_process = artifacts_to_process[:limit]
        logger.info(f"限制处理前 {limit} 件藏品")
    
    logger.info(f"将处理 {len(artifacts_to_process)} 件藏品")
    
    # 检查是否使用AI生成问答题
    if use_ai:
        # 先测试API连接
        if not test_openai_connection():
            logger.error("OpenAI API连接测试失败，将使用简单规则生成问答题")
            use_ai = False
        else:
            logger.info("OpenAI API连接测试成功，将使用AI生成问答题")
    
    # 生成问答题
    if use_ai:
        # 使用AI生成问答题
        logger.info("使用AI生成问答题...")
        for artifact in tqdm(artifacts_to_process, desc="生成问答题"):
            if artifact.get("description"):
                logger.debug(f"为藏品 '{artifact['name']}' 生成AI问答题")
                ai_quizzes = generate_quiz_with_ai(artifact, api_key)
                if ai_quizzes:
                    logger.debug(f"成功生成 {len(ai_quizzes)} 个问答题")
                    quizzes.extend(ai_quizzes)
                else:
                    logger.warning(f"藏品 '{artifact['name']}' 未生成任何问答题")
            else:
                logger.warning(f"跳过藏品 '{artifact['name']}' (无描述)")
    else:
        # 使用原来的简单逻辑生成问答题
        logger.info("使用简单规则生成问答题...")
        for artifact in tqdm(artifacts_to_process, desc="生成问答题"):
            # 为每个藏品生成1-2个问题
            if artifact.get("description"):
                # 问题1: 关于藏品时期
                quiz1 = {
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
                quizzes.append(quiz1)
                
                # 问题2: 关于藏品特征 (如果有描述的话)
                description = artifact["description"]
                if len(description) > 20:  # 确保描述有足够的内容
                    # 从描述中提取一个特征作为问题
                    quiz2 = {
                        "id": f"quiz_{artifact['id']}_2",
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
                    quizzes.append(quiz2)
    
    # 构建最终的JSON结构
    quiz_data = {
        "quizzes": quizzes
    }
    
    # 保存为JSON文件
    try:
        with open(output_file, 'w', encoding='utf-8') as f:
            json.dump(quiz_data, f, ensure_ascii=False, indent=2)
        logger.info(f"问答题生成完成，已保存到: {output_file}")
        logger.info(f"总共生成了 {len(quizzes)} 道题目")
    except Exception as e:
        logger.error(f"保存问答题数据失败: {e}")
        traceback.print_exc()
    
    return quiz_data

if __name__ == "__main__":
    logger.info("=== 藏品数据处理程序启动 ===")
    
    # 输出环境信息
    logger.info(f"Python版本: {sys.version}")
    logger.info(f"当前工作目录: {os.getcwd()}")
    logger.info(f"OpenAI库版本: {openai.__version__}")
    
    # 解析命令行参数
    parser = argparse.ArgumentParser(description="处理藏品数据并生成问答题")
    parser.add_argument("--input", required=True, help="输入CSV文件路径")
    parser.add_argument("--output-dir", required=True, help="输出目录")
    parser.add_argument("--use-ai", action="store_true", help="是否使用AI生成问答题")
    parser.add_argument("--api-key", help="OpenAI API密钥")
    parser.add_argument("--limit", type=int, help="限制处理的藏品数量，用于测试")
    
    args = parser.parse_args()
    
    # 检查输入文件是否存在
    if not os.path.exists(args.input):
        logger.error(f"输入文件不存在: {args.input}")
        sys.exit(1)
    
    # 创建输出目录
    output_dir = Path(args.output_dir)
    output_dir.mkdir(exist_ok=True)
    logger.info(f"输出目录: {output_dir}")
    
    # 处理藏品数据
    collection_data = process_collection_data(
        args.input, 
        output_dir / "artifacts.json"
    )
    
    # 生成问答题数据
    generate_quiz_data(
        collection_data,
        output_dir / "quizzes.json",
        use_ai=args.use_ai,
        api_key=args.api_key,
        limit=args.limit
    )
    
    logger.info("=== 藏品数据处理程序完成 ===") 