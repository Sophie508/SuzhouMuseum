import openai
import os
import json

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
    
    try:
        print(f"调用OpenAI API...")
        # 调用OpenAI API
        response = openai.chat.completions.create(
            model="gpt-4o-mini",
            messages=[{"role": "user", "content": prompt}],
            temperature=0.7
        )
        
        # 解析结果
        result_text = response.choices[0].message.content
        print(f"API响应内容: {result_text[:100]}...")  # 打印前100个字符以便调试
        
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