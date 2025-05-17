#!/usr/bin/env python3

import json
from collections import defaultdict
import os

# 加载藏品数据
def load_artifacts(file_path):
    with open(file_path, 'r', encoding='utf-8') as f:
        return json.load(f)

# 保存藏品数据
def save_artifacts(data, file_path):
    with open(file_path, 'w', encoding='utf-8') as f:
        json.dump(data, f, ensure_ascii=False, indent=2)
    print(f"已保存修复后的数据到: {file_path}")

def fix_duplicate_names(input_file, output_file):
    # 加载原始数据
    artifacts_data = load_artifacts(input_file)
    
    # 检查藏品名称重复
    name_to_artifacts = defaultdict(list)
    for artifact in artifacts_data['artifacts']:
        name_to_artifacts[artifact['name']].append(artifact)
    
    # 查找重复名称
    duplicate_names = {name: artifacts for name, artifacts in name_to_artifacts.items() if len(artifacts) > 1}
    
    print(f"总藏品数量: {len(artifacts_data['artifacts'])}")
    print(f"重复名称的藏品数量: {len(duplicate_names)}")
    
    # 修复特殊情况
    for artifact in artifacts_data['artifacts']:
        if artifact['name'] == '名称':
            # 使用fullName作为name
            if artifact['fullName']:
                print(f"修复: ID {artifact['id']} 将'名称'更改为 '{artifact['fullName']}'")
                artifact['name'] = artifact['fullName'].replace('【', '').replace('】', '')
    
    # 修复其他重复名称
    for name, artifacts in duplicate_names.items():
        if name == '名称':
            continue  # 已在上面处理过
            
        for i, artifact in enumerate(artifacts):
            # 跳过第一个实例，只修改重复项
            if i == 0:
                continue
                
            # 使用朝代或尺寸来区分
            period = artifact.get('period', '')
            dimensions = artifact.get('dimensions', '')
            
            if period and period in artifact['name']:
                # 如果名称中已包含朝代，则添加编号
                new_name = f"{artifact['name']}{i+1}"
            elif period:
                # 添加朝代作为区分
                new_name = f"{artifact['name']}（{period}）"
            elif dimensions:
                # 使用尺寸作为区分
                size_part = dimensions.split(' ')[1:3] if len(dimensions.split(' ')) > 2 else [dimensions]
                size_str = ' '.join(size_part)
                new_name = f"{artifact['name']}（{size_str}）"
            else:
                # 最后手段是添加编号
                new_name = f"{artifact['name']}{i+1}"
                
            print(f"修复: ID {artifact['id']} 将'{name}'更改为 '{new_name}'")
            artifact['name'] = new_name
    
    # 保存修复后的数据
    save_artifacts(artifacts_data, output_file)
    
    # 再次检查是否还有重复
    name_to_artifacts = defaultdict(list)
    for artifact in artifacts_data['artifacts']:
        name_to_artifacts[artifact['name']].append(artifact)
    
    remaining_duplicates = {name: artifacts for name, artifacts in name_to_artifacts.items() if len(artifacts) > 1}
    print(f"修复后，重复名称的藏品数量: {len(remaining_duplicates)}")
    
    return artifacts_data

def add_missing_quizzes(artifacts_data, quizzes_file, output_file):
    # 加载测验数据
    with open(quizzes_file, 'r', encoding='utf-8') as f:
        quizzes_data = json.load(f)
    
    # 找出没有测验的藏品ID
    artifact_ids = {a['id'] for a in artifacts_data['artifacts']}
    quiz_artifact_ids = {q['artifactId'] for q in quizzes_data['quizzes']}
    artifacts_without_quiz = artifact_ids - quiz_artifact_ids
    
    print(f"\n无测验的藏品数量: {len(artifacts_without_quiz)}")
    
    if not artifacts_without_quiz:
        print("所有藏品都有对应的测验，无需添加")
        return quizzes_data
    
    # 为缺少测验的藏品创建通用测验
    id_to_artifact = {a['id']: a for a in artifacts_data['artifacts']}
    
    for artifact_id in artifacts_without_quiz:
        artifact = id_to_artifact[artifact_id]
        new_quiz = {
            "question": f"关于{artifact['period'] if artifact['period'] else ''}《{artifact['name']}》的特点，以下哪项描述是正确的？",
            "options": [
                {
                    "id": "a",
                    "text": f"{artifact['name']}是{artifact['period'] if artifact['period'] else '古代'}的一件重要文物，反映了当时的艺术水平和文化背景。"
                },
                {
                    "id": "b",
                    "text": f"{artifact['name']}主要用于宗教仪式，是佛教艺术的重要代表。"
                },
                {
                    "id": "c",
                    "text": f"{artifact['name']}的制作技艺主要受到了西方文化的影响，融合了多种风格。"
                },
                {
                    "id": "d",
                    "text": f"{artifact['name']}是皇家专用的礼器，象征着皇权和地位。"
                }
            ],
            "correctAnswer": "a",
            "explanation": f"正确答案是选项A。{artifact['name']}是{artifact['period'] if artifact['period'] else '古代'}的文物，{artifact.get('description', '')}这件文物的发现和保存对于我们了解{artifact['period'] if artifact['period'] else '古代'}的文化和艺术有着重要的意义。",
            "artifactId": artifact_id,
            "id": f"quiz_{artifact_id}_1"
        }
        
        quizzes_data['quizzes'].append(new_quiz)
        print(f"为藏品ID {artifact_id} ({artifact['name']}) 添加了测验")
    
    # 保存更新后的测验数据
    with open(output_file, 'w', encoding='utf-8') as f:
        json.dump(quizzes_data, f, ensure_ascii=False, indent=2)
    
    print(f"已保存更新后的测验数据到: {output_file}")
    return quizzes_data

def sync_to_public(cleaned_artifacts_file, cleaned_quizzes_file, public_dir):
    """将处理好的数据同步到public目录"""
    # 复制处理好的藏品数据到public目录
    artifacts_data = load_artifacts(cleaned_artifacts_file)
    public_artifacts_file = os.path.join(public_dir, 'artifacts.json')
    save_artifacts(artifacts_data, public_artifacts_file)
    
    # 复制处理好的测验数据到public目录
    with open(cleaned_quizzes_file, 'r', encoding='utf-8') as f:
        quizzes_data = json.load(f)
    
    public_quizzes_file = os.path.join(public_dir, 'quizzes.json')
    with open(public_quizzes_file, 'w', encoding='utf-8') as f:
        json.dump(quizzes_data, f, ensure_ascii=False, indent=2)
    
    print(f"数据已同步到public目录")

def main():
    # 文件路径
    input_artifacts_file = 'cleaned_data/artifacts.json'
    fixed_artifacts_file = 'cleaned_data/artifacts_fixed.json'
    
    input_quizzes_file = 'cleaned_data/quizzes.json'
    fixed_quizzes_file = 'cleaned_data/quizzes_fixed.json'
    
    public_dir = 'public/data'
    
    # 1. 修复重复名称藏品
    artifacts_data = fix_duplicate_names(input_artifacts_file, fixed_artifacts_file)
    
    # 2. 添加缺失的测验
    add_missing_quizzes(artifacts_data, input_quizzes_file, fixed_quizzes_file)
    
    # 3. 同步到public目录
    sync_to_public(fixed_artifacts_file, fixed_quizzes_file, public_dir)
    
    print("数据修复和同步完成!")

if __name__ == "__main__":
    main() 