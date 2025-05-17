#!/usr/bin/env python3

import json
from collections import defaultdict

# 加载藏品数据
with open('cleaned_data/artifacts.json', 'r', encoding='utf-8') as f:
    artifacts_data = json.load(f)

# 加载测验数据
with open('cleaned_data/quizzes.json', 'r', encoding='utf-8') as f:
    quizzes_data = json.load(f)

# 检查藏品名称重复
name_to_ids = defaultdict(list)
for artifact in artifacts_data['artifacts']:
    name_to_ids[artifact['name']].append(artifact['id'])

# 查找重复名称
duplicate_names = {name: ids for name, ids in name_to_ids.items() if len(ids) > 1}

print(f"总藏品数量: {len(artifacts_data['artifacts'])}")
print(f"重复名称的藏品数量: {len(duplicate_names)}")
print(f"重复名称示例:")
for i, (name, ids) in enumerate(list(duplicate_names.items())[:10]):
    print(f"  {i+1}. 名称: '{name}', 出现次数: {len(ids)}, ID列表: {ids}")

# 检查藏品与测验的匹配
artifact_ids = {a['id'] for a in artifacts_data['artifacts']}
quiz_artifact_ids = {q['artifactId'] for q in quizzes_data['quizzes']}

# 检查无测验的藏品
artifacts_without_quiz = artifact_ids - quiz_artifact_ids
print(f"\n无测验的藏品数量: {len(artifacts_without_quiz)}")
if artifacts_without_quiz:
    print(f"无测验的藏品ID示例: {list(artifacts_without_quiz)[:10]}")

# 检查测验中没有对应藏品的情况
quizzes_without_artifact = quiz_artifact_ids - artifact_ids
print(f"\n测验中没有对应藏品的数量: {len(quizzes_without_artifact)}")
if quizzes_without_artifact:
    print(f"没有对应藏品的测验artifactId示例: {list(quizzes_without_artifact)[:10]}")

# 检查每个藏品的测验数量
artifact_id_to_quiz_count = defaultdict(int)
for quiz in quizzes_data['quizzes']:
    artifact_id_to_quiz_count[quiz['artifactId']] += 1

# 查找有多个测验的藏品
artifacts_with_multiple_quizzes = {
    artifact_id: count for artifact_id, count in artifact_id_to_quiz_count.items() if count > 1
}

print(f"\n有多个测验的藏品数量: {len(artifacts_with_multiple_quizzes)}")
if artifacts_with_multiple_quizzes:
    print(f"有多个测验的藏品示例:")
    for i, (artifact_id, count) in enumerate(list(artifacts_with_multiple_quizzes.items())[:10]):
        print(f"  {i+1}. 藏品ID: {artifact_id}, 测验数量: {count}") 