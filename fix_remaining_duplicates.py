#!/usr/bin/env python3

import json
from collections import defaultdict
import os
import re

# 加载藏品数据
def load_artifacts(file_path):
    with open(file_path, 'r', encoding='utf-8') as f:
        return json.load(f)

# 保存藏品数据
def save_artifacts(data, file_path):
    with open(file_path, 'w', encoding='utf-8') as f:
        json.dump(data, f, ensure_ascii=False, indent=2)
    print(f"已保存修复后的数据到: {file_path}")

# 查找剩余的重复名称
def find_remaining_duplicates(artifacts_data):
    name_to_artifacts = defaultdict(list)
    for artifact in artifacts_data['artifacts']:
        name_to_artifacts[artifact['name']].append(artifact)
    
    duplicate_names = {name: artifacts for name, artifacts in name_to_artifacts.items() if len(artifacts) > 1}
    
    print(f"剩余重复名称的藏品数量: {len(duplicate_names)}")
    if duplicate_names:
        print("重复名称包括:")
        for name, artifacts in duplicate_names.items():
            print(f"  - '{name}': {len(artifacts)}件 (ID: {[a['id'] for a in artifacts]})")
    
    return duplicate_names

# 进一步修复重复名称
def fix_remaining_duplicates(artifacts_data, output_file):
    duplicate_names = find_remaining_duplicates(artifacts_data)
    
    # 处理剩余的重复名称
    for name, artifacts in duplicate_names.items():
        for i, artifact in enumerate(artifacts):
            # 使用附加信息创建唯一名称
            description = artifact.get('description', '')
            period = artifact.get('period', '')
            location = artifact.get('location', '')
            dimensions = artifact.get('dimensions', '')
            
            # 从描述中提取独特信息
            unique_info = ""
            if description:
                # 尝试提取描述中的关键特征
                features = re.findall(r'([^，。；\s]{3,8})[，。；]', description[:50])
                if features:
                    unique_info = features[0]
            
            # 如果从描述中没有找到独特信息，尝试使用尺寸或位置
            if not unique_info and dimensions:
                size_match = re.search(r'(\d+\.?\d*\s*[厘米|cm])', dimensions)
                if size_match:
                    unique_info = size_match.group(1)
            
            if not unique_info and location:
                unique_info = location.split('馆')[-1] if '馆' in location else location
            
            # 如果仍未找到独特信息，使用编号
            if not unique_info:
                unique_info = f"编号{i+1}"
            
            # 创建新名称
            if i > 0:  # 第一个实例保持不变
                new_name = f"{name}（{unique_info}）"
                print(f"修复: ID {artifact['id']} 将'{name}'更改为 '{new_name}'")
                artifact['name'] = new_name
    
    # 再次检查是否还有重复
    remaining = find_remaining_duplicates(artifacts_data)
    
    # 如果仍有重复，使用简单的编号策略
    if remaining:
        print("使用简单编号策略解决剩余重复...")
        for name, artifacts in remaining.items():
            for i, artifact in enumerate(artifacts):
                if i > 0:  # 第一个实例保持不变
                    new_name = f"{name} #{i+1}"
                    print(f"最终修复: ID {artifact['id']} 将'{name}'更改为 '{new_name}'")
                    artifact['name'] = new_name
    
    # 保存修复后的数据
    save_artifacts(artifacts_data, output_file)
    
    # 确认所有重复都已解决
    final_check = find_remaining_duplicates(artifacts_data)
    if not final_check:
        print("所有重复名称已成功解决!")
    
    return artifacts_data

# 更新测验中的藏品名称引用
def update_quizzes_with_artifact_names(artifacts_data, quizzes_file, output_file):
    # 创建藏品ID到名称的映射
    id_to_name = {artifact['id']: artifact['name'] for artifact in artifacts_data['artifacts']}
    
    # 加载测验数据
    with open(quizzes_file, 'r', encoding='utf-8') as f:
        quizzes_data = json.load(f)
    
    updated_count = 0
    
    # 更新每个测验的问题和选项中的藏品名称引用
    for quiz in quizzes_data['quizzes']:
        artifact_id = quiz['artifactId']
        if artifact_id in id_to_name:
            artifact_name = id_to_name[artifact_id]
            
            # 检测并替换问题中的藏品名称
            old_name_pattern = r'《([^》]+)》'
            matches = re.findall(old_name_pattern, quiz['question'])
            if matches:
                for old_name in matches:
                    if old_name != artifact_name and old_name in quiz['question']:
                        quiz['question'] = quiz['question'].replace(f"《{old_name}》", f"《{artifact_name}》")
                        updated_count += 1
            
            # 更新选项中的藏品名称
            for option in quiz['options']:
                for old_name in matches:
                    if old_name != artifact_name and old_name in option['text']:
                        option['text'] = option['text'].replace(old_name, artifact_name)
                        updated_count += 1
            
            # 更新解释中的藏品名称
            for old_name in matches:
                if old_name != artifact_name and old_name in quiz['explanation']:
                    quiz['explanation'] = quiz['explanation'].replace(old_name, artifact_name)
                    updated_count += 1
    
    print(f"已更新 {updated_count} 处测验中的藏品名称引用")
    
    # 保存更新后的测验数据
    with open(output_file, 'w', encoding='utf-8') as f:
        json.dump(quizzes_data, f, ensure_ascii=False, indent=2)
    
    print(f"已保存更新后的测验数据到: {output_file}")
    return quizzes_data

# 验证藏品和测验的对应关系
def validate_artifacts_quizzes_mapping(artifacts_data, quizzes_data):
    artifact_ids = {a['id'] for a in artifacts_data['artifacts']}
    quiz_artifact_ids = {q['artifactId'] for q in quizzes_data['quizzes']}
    
    # 验证每个藏品都有测验
    artifacts_without_quiz = artifact_ids - quiz_artifact_ids
    if artifacts_without_quiz:
        print(f"警告: 有 {len(artifacts_without_quiz)} 个藏品没有对应的测验")
        print(f"示例: {list(artifacts_without_quiz)[:5]}")
    else:
        print("验证成功: 每个藏品都有至少一个对应的测验")
    
    # 验证每个测验都有对应藏品
    quizzes_without_artifact = quiz_artifact_ids - artifact_ids
    if quizzes_without_artifact:
        print(f"警告: 有 {len(quizzes_without_artifact)} 个测验没有对应的藏品")
        print(f"示例: {list(quizzes_without_artifact)[:5]}")
    else:
        print("验证成功: 每个测验都有对应的藏品")
    
    # 验证藏品名称的唯一性
    name_to_ids = defaultdict(list)
    for artifact in artifacts_data['artifacts']:
        name_to_ids[artifact['name']].append(artifact['id'])
    
    duplicate_names = {name: ids for name, ids in name_to_ids.items() if len(ids) > 1}
    if duplicate_names:
        print(f"警告: 仍有 {len(duplicate_names)} 个重复名称")
        print(f"示例: {list(duplicate_names.items())[:5]}")
    else:
        print("验证成功: 所有藏品名称都是唯一的")
    
    return len(artifacts_without_quiz) == 0 and len(quizzes_without_artifact) == 0 and len(duplicate_names) == 0

def main():
    # 文件路径
    input_artifacts_file = 'cleaned_data/artifacts_fixed.json'
    final_artifacts_file = 'cleaned_data/artifacts_final.json'
    
    input_quizzes_file = 'cleaned_data/quizzes_fixed.json'
    final_quizzes_file = 'cleaned_data/quizzes_final.json'
    
    public_dir = 'public/data'
    
    # 1. 加载上一步修复后的藏品数据
    artifacts_data = load_artifacts(input_artifacts_file)
    
    # 2. 修复剩余的重复名称
    artifacts_data = fix_remaining_duplicates(artifacts_data, final_artifacts_file)
    
    # 3. 更新测验中的藏品名称引用
    with open(input_quizzes_file, 'r', encoding='utf-8') as f:
        quizzes_data = json.load(f)
    
    updated_quizzes_data = update_quizzes_with_artifact_names(artifacts_data, input_quizzes_file, final_quizzes_file)
    
    # 4. 验证藏品和测验的对应关系
    validation_result = validate_artifacts_quizzes_mapping(artifacts_data, updated_quizzes_data)
    
    # 5. 同步到public目录
    if validation_result:
        public_artifacts_file = os.path.join(public_dir, 'artifacts.json')
        save_artifacts(artifacts_data, public_artifacts_file)
        
        public_quizzes_file = os.path.join(public_dir, 'quizzes.json')
        with open(public_quizzes_file, 'w', encoding='utf-8') as f:
            json.dump(updated_quizzes_data, f, ensure_ascii=False, indent=2)
        
        print(f"数据已同步到public目录")
        print("数据修复和同步完成!")
    else:
        print("数据验证失败，请解决上述问题后再同步到public目录")

if __name__ == "__main__":
    main() 