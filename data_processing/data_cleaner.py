import pandas as pd
import json
import os
from pathlib import Path
from typing import List, Dict, Any
import requests
from PIL import Image
from io import BytesIO
from tqdm import tqdm

class MuseumDataCleaner:
    def __init__(self, input_dir: str = "raw_data", output_dir: str = "cleaned_data"):
        """
        初始化数据清洗器
        
        Args:
            input_dir: 原始数据目录
            output_dir: 清洗后的数据输出目录
        """
        self.input_dir = Path(input_dir)
        self.output_dir = Path(output_dir)
        self.output_dir.mkdir(parents=True, exist_ok=True)
        
    def clean_artifact_data(self, raw_data: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        """
        清洗藏品数据
        
        Args:
            raw_data: 原始藏品数据列表
            
        Returns:
            清洗后的藏品数据列表
        """
        cleaned_data = []
        for item in tqdm(raw_data, desc="Cleaning artifact data"):
            cleaned_item = {
                "id": self._generate_id(item.get("name", "")),
                "name": self._clean_text(item.get("name", "")),
                "category": self._clean_text(item.get("category", "")),
                "period": self._clean_text(item.get("period", "")),
                "image": self._validate_image_url(item.get("image", "")),
                "largeImage": self._validate_image_url(item.get("largeImage", "")),
                "description": self._clean_text(item.get("description", "")),
                "location": self._clean_text(item.get("location", "")),
                "interestingFacts": self._clean_text(item.get("interestingFacts", "")),
                "culturalContext": self._clean_text(item.get("culturalContext", ""))
            }
            cleaned_data.append(cleaned_item)
        return cleaned_data
    
    def clean_quiz_data(self, raw_data: List[Dict[str, Any]], artifacts: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        """
        清洗答题数据
        
        Args:
            raw_data: 原始答题数据列表
            artifacts: 藏品数据列表（用于验证关联）
            
        Returns:
            清洗后的答题数据列表
        """
        artifact_ids = {item["id"] for item in artifacts}
        cleaned_data = []
        
        for item in tqdm(raw_data, desc="Cleaning quiz data"):
            if item.get("artifactId") not in artifact_ids:
                print(f"Warning: Question {item.get('id')} references non-existent artifact {item.get('artifactId')}")
                continue
                
            cleaned_item = {
                "id": self._generate_id(item.get("question", "")),
                "artifactId": item.get("artifactId"),
                "question": self._clean_text(item.get("question", "")),
                "options": [
                    {"id": opt.get("id", ""), "text": self._clean_text(opt.get("text", ""))}
                    for opt in item.get("options", [])
                ],
                "correctAnswer": item.get("correctAnswer", ""),
                "explanation": self._clean_text(item.get("explanation", ""))
            }
            cleaned_data.append(cleaned_item)
        return cleaned_data
    
    def _clean_text(self, text: str) -> str:
        """
        清理文本数据
        
        Args:
            text: 原始文本
            
        Returns:
            清理后的文本
        """
        if not isinstance(text, str):
            return ""
        # 移除多余的空白字符
        text = " ".join(text.split())
        # 移除特殊字符
        text = text.replace("\n", " ").replace("\r", " ").replace("\t", " ")
        return text.strip()
    
    def _generate_id(self, text: str) -> str:
        """
        生成唯一ID
        
        Args:
            text: 用于生成ID的文本
            
        Returns:
            生成的ID
        """
        # 这里可以根据需要实现不同的ID生成策略
        return text.lower().replace(" ", "_")
    
    def _validate_image_url(self, url: str) -> str:
        """
        验证图片URL
        
        Args:
            url: 图片URL
            
        Returns:
            验证后的URL
        """
        if not url:
            return ""
        try:
            response = requests.head(url)
            if response.status_code == 200:
                return url
            return ""
        except:
            return ""
    
    def save_cleaned_data(self, data: Dict[str, List[Dict[str, Any]]], filename: str):
        """
        保存清洗后的数据
        
        Args:
            data: 清洗后的数据
            filename: 输出文件名
        """
        output_path = self.output_dir / filename
        with open(output_path, "w", encoding="utf-8") as f:
            json.dump(data, f, ensure_ascii=False, indent=2)
        print(f"Cleaned data saved to {output_path}")

def main():
    # 示例使用
    cleaner = MuseumDataCleaner()
    
    # 这里需要根据实际数据源进行修改
    # 例如，从CSV文件读取数据：
    # artifacts_df = pd.read_csv("raw_data/artifacts.csv")
    # artifacts_data = artifacts_df.to_dict("records")
    
    # 或者从JSON文件读取数据：
    # with open("raw_data/artifacts.json", "r", encoding="utf-8") as f:
    #     artifacts_data = json.load(f)
    
    # 清洗数据
    # cleaned_artifacts = cleaner.clean_artifact_data(artifacts_data)
    # cleaned_quizzes = cleaner.clean_quiz_data(quiz_data, cleaned_artifacts)
    
    # 保存清洗后的数据
    # cleaner.save_cleaned_data({
    #     "artifacts": cleaned_artifacts,
    #     "quizQuestions": cleaned_quizzes
    # }, "museum_data.json")

if __name__ == "__main__":
    main() 