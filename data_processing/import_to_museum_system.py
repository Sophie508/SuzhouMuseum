import json
import os
import shutil
from pathlib import Path
import argparse
from tqdm import tqdm

class MuseumDataImporter:
    def __init__(self, museum_root_dir):
        """
        初始化导入器
        
        Args:
            museum_root_dir: 博物馆交互系统的根目录
        """
        self.museum_root_dir = Path(museum_root_dir)
        
        # 确认系统目录
        self.pre_visit_dir = self.museum_root_dir / "app" / "pre-visit"
        self.during_visit_dir = self.museum_root_dir / "app" / "during-visit"
        self.post_visit_dir = self.museum_root_dir / "app" / "post-visit"
        self.public_dir = self.museum_root_dir / "public"
        
        # 验证目录是否存在
        self._validate_museum_structure()
        
    def _validate_museum_structure(self):
        """验证博物馆系统目录结构"""
        if not self.museum_root_dir.exists():
            raise FileNotFoundError(f"博物馆系统根目录不存在: {self.museum_root_dir}")
            
        if not self.pre_visit_dir.exists():
            raise FileNotFoundError(f"pre-visit目录不存在: {self.pre_visit_dir}")
            
        if not self.during_visit_dir.exists():
            raise FileNotFoundError(f"during-visit目录不存在: {self.during_visit_dir}")
            
        if not self.post_visit_dir.exists():
            raise FileNotFoundError(f"post-visit目录不存在: {self.post_visit_dir}")
            
        if not self.public_dir.exists():
            raise FileNotFoundError(f"public目录不存在: {self.public_dir}")
    
    def import_artifacts(self, artifacts_json_file):
        """
        导入藏品数据到系统
        
        Args:
            artifacts_json_file: 处理后的藏品JSON文件路径
        """
        print(f"开始导入藏品数据: {artifacts_json_file}")
        
        # 读取藏品数据
        with open(artifacts_json_file, 'r', encoding='utf-8') as f:
            artifacts_data = json.load(f)
            
        # 1. 准备藏品数据目录
        artifacts_data_dir = self.public_dir / "data"
        artifacts_data_dir.mkdir(exist_ok=True)
        
        # 2. 保存完整藏品数据
        artifacts_output_file = artifacts_data_dir / "artifacts.json"
        with open(artifacts_output_file, 'w', encoding='utf-8') as f:
            json.dump(artifacts_data, f, ensure_ascii=False, indent=2)
            
        print(f"藏品数据已保存到: {artifacts_output_file}")
        
        # 3. 为Pre-visit页面准备推荐藏品数据 (选择前12个有图片的藏品)
        recommended_artifacts = []
        for artifact in artifacts_data["artifacts"]:
            if artifact["image"] and len(recommended_artifacts) < 12:
                recommended_artifacts.append({
                    "id": artifact["id"],
                    "name": artifact["name"],
                    "period": artifact["period"],
                    "image": artifact["image"],
                    "description": artifact["description"][:150] + "..." if len(artifact["description"]) > 150 else artifact["description"]
                })
        
        # 保存推荐藏品数据
        recommended_file = artifacts_data_dir / "recommended_artifacts.json"
        with open(recommended_file, 'w', encoding='utf-8') as f:
            json.dump({"recommendedArtifacts": recommended_artifacts}, f, ensure_ascii=False, indent=2)
            
        print(f"推荐藏品数据已保存到: {recommended_file}")
        
        # 4. 复制图片到public/images目录
        self._copy_images(artifacts_data["artifacts"])
        
        return artifacts_data
    
    def import_quizzes(self, quizzes_json_file):
        """
        导入问答题数据到系统
        
        Args:
            quizzes_json_file: 处理后的问答题JSON文件路径
        """
        print(f"开始导入问答题数据: {quizzes_json_file}")
        
        # 读取问答题数据
        with open(quizzes_json_file, 'r', encoding='utf-8') as f:
            quizzes_data = json.load(f)
            
        # 准备问答题数据目录
        quizzes_data_dir = self.public_dir / "data"
        quizzes_data_dir.mkdir(exist_ok=True)
        
        # 保存问答题数据
        quizzes_output_file = quizzes_data_dir / "quizzes.json"
        with open(quizzes_output_file, 'w', encoding='utf-8') as f:
            json.dump(quizzes_data, f, ensure_ascii=False, indent=2)
            
        print(f"问答题数据已保存到: {quizzes_output_file}")
        
        return quizzes_data
    
    def _copy_images(self, artifacts):
        """
        复制藏品图片到public/images目录
        
        Args:
            artifacts: 藏品数据列表
        """
        # 准备图片目录
        images_dir = self.public_dir / "images" / "artifacts"
        images_dir.mkdir(exist_ok=True, parents=True)
        
        # 创建一个映射以跟踪已处理的图片
        image_url_to_filename = {}
        
        print("开始复制藏品图片...")
        for artifact in tqdm(artifacts, desc="复制图片"):
            if not artifact["image"]:
                continue
                
            # 从URL中提取文件名
            image_url = artifact["image"]
            
            # 使用本地图片路径中的文件名（如果有）
            if artifact["localImage"] and "/" in artifact["localImage"]:
                filename = artifact["localImage"].split("/")[-1]
            else:
                # 否则从URL中提取文件名
                if "/" in image_url:
                    filename = image_url.split("/")[-1]
                else:
                    # 如果无法从URL提取文件名，使用藏品ID作为文件名
                    extension = ".jpg"  # 默认扩展名
                    filename = f"artifact_{artifact['id']}{extension}"
            
            # 检查文件名是否已存在于映射中
            if image_url in image_url_to_filename:
                # 如果URL已处理过，跳过
                continue
                
            # 将URL添加到映射
            image_url_to_filename[image_url] = filename
                
            # 假设现在我们只有URL而没有实际的图片文件
            # 在实际情况中，您需要:
            # 1. 如果有本地图片，复制本地图片
            # 2. 如果没有本地图片，从URL下载图片
            
            # 这里我们只创建一个空的占位文件
            placeholder_file = images_dir / filename
            if not placeholder_file.exists():
                with open(placeholder_file, 'w') as f:
                    f.write(f"图片占位符: {image_url}\n")
                    f.write("实际部署时，请下载真实图片或复制本地图片")
                    
        print(f"已处理 {len(image_url_to_filename)} 张图片")
        
    def update_system_config(self, artifacts_data, quizzes_data):
        """
        更新系统配置以使用新导入的数据
        
        Args:
            artifacts_data: 导入的藏品数据
            quizzes_data: 导入的问答题数据
        """
        print("开始更新系统配置...")
        
        # 在实际情况中，可能需要修改系统配置文件或数据库
        # 这里我们创建一个简单的配置文件来记录导入的内容
        
        config = {
            "lastImport": {
                "timestamp": import_time,
                "artifactsCount": len(artifacts_data["artifacts"]),
                "quizzesCount": len(quizzes_data["quizzes"])
            },
            "dataLocations": {
                "artifacts": "/public/data/artifacts.json",
                "recommendedArtifacts": "/public/data/recommended_artifacts.json",
                "quizzes": "/public/data/quizzes.json",
                "imagesDir": "/public/images/artifacts"
            }
        }
        
        config_file = self.public_dir / "data" / "import_config.json"
        with open(config_file, 'w', encoding='utf-8') as f:
            json.dump(config, f, ensure_ascii=False, indent=2)
            
        print(f"系统配置已更新: {config_file}")
        
        # 创建一个README文件，解释如何在系统中使用导入的数据
        readme_file = self.public_dir / "data" / "README.md"
        with open(readme_file, 'w', encoding='utf-8') as f:
            f.write("# 导入的博物馆数据使用说明\n\n")
            f.write("## 数据文件\n\n")
            f.write("- `artifacts.json`: 完整的藏品数据\n")
            f.write("- `recommended_artifacts.json`: 为pre-visit页面准备的推荐藏品数据\n")
            f.write("- `quizzes.json`: 问答题数据\n\n")
            f.write("## 在系统中使用\n\n")
            f.write("### Pre-visit页面\n\n")
            f.write("在Pre-visit页面中，您可以使用`recommendedArtifacts`中的数据显示推荐藏品。\n\n")
            f.write("```javascript\n")
            f.write("// 示例代码\n")
            f.write("import recommendedData from '../public/data/recommended_artifacts.json';\n")
            f.write("const { recommendedArtifacts } = recommendedData;\n")
            f.write("```\n\n")
            f.write("### During-visit页面\n\n")
            f.write("在During-visit页面中，您可以使用`artifacts.json`中的完整数据显示藏品详情。\n\n")
            f.write("```javascript\n")
            f.write("// 示例代码\n")
            f.write("import artifactsData from '../public/data/artifacts.json';\n")
            f.write("const { artifacts } = artifactsData;\n")
            f.write("```\n\n")
            f.write("### Post-visit页面\n\n")
            f.write("在Post-visit页面中，您可以使用`quizzes.json`中的数据显示问答题。\n\n")
            f.write("```javascript\n")
            f.write("// 示例代码\n")
            f.write("import quizzesData from '../public/data/quizzes.json';\n")
            f.write("const { quizzes } = quizzesData;\n")
            f.write("```\n")
        
        print(f"使用说明已创建: {readme_file}")
        
def main():
    # 解析命令行参数
    parser = argparse.ArgumentParser(description="将处理后的数据导入到博物馆交互系统")
    parser.add_argument("--museum-dir", required=True, help="博物馆交互系统的根目录")
    parser.add_argument("--artifacts-file", required=True, help="处理后的藏品JSON文件路径")
    parser.add_argument("--quizzes-file", required=True, help="处理后的问答题JSON文件路径")
    
    args = parser.parse_args()
    
    # 创建导入器
    importer = MuseumDataImporter(args.museum_dir)
    
    # 导入数据
    artifacts_data = importer.import_artifacts(args.artifacts_file)
    quizzes_data = importer.import_quizzes(args.quizzes_file)
    
    # 更新系统配置
    importer.update_system_config(artifacts_data, quizzes_data)
    
    print("数据导入完成！")

if __name__ == "__main__":
    import datetime
    
    # 记录导入时间
    import_time = datetime.datetime.now().isoformat()
    
    main() 