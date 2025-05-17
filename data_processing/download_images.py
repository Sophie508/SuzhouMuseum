import json
import os
import requests
from pathlib import Path
import argparse
from tqdm import tqdm
import concurrent.futures
import time
import random

def download_image(url, save_path, retries=3, timeout=30, delay=1):
    """
    下载图片并保存到指定路径
    
    Args:
        url: 图片URL
        save_path: 保存路径
        retries: 重试次数
        timeout: 超时时间（秒）
        delay: 请求间隔（秒）
    
    Returns:
        bool: 是否下载成功
    """
    if not url:
        return False
    
    # 确保保存路径的目录存在
    save_dir = os.path.dirname(save_path)
    if not os.path.exists(save_dir):
        os.makedirs(save_dir, exist_ok=True)
    
    # 如果文件已存在，跳过下载
    if os.path.exists(save_path):
        return True
    
    # 添加随机延迟，避免过快请求
    time.sleep(delay + random.uniform(0, 1))
    
    headers = {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
    }
    
    for attempt in range(retries):
        try:
            response = requests.get(url, headers=headers, timeout=timeout, stream=True)
            if response.status_code == 200:
                with open(save_path, 'wb') as f:
                    for chunk in response.iter_content(chunk_size=8192):
                        f.write(chunk)
                return True
            else:
                print(f"下载失败 ({response.status_code}): {url}")
                time.sleep(delay * (attempt + 1))  # 增加重试间隔
        except Exception as e:
            print(f"下载异常 ({attempt+1}/{retries}): {url} - {str(e)}")
            if attempt < retries - 1:
                time.sleep(delay * (attempt + 1))  # 增加重试间隔
    
    return False

def process_artifacts_images(artifacts_file, output_dir, max_workers=5):
    """
    处理藏品数据中的图片并下载
    
    Args:
        artifacts_file: 藏品JSON文件路径
        output_dir: 图片保存目录
        max_workers: 最大并发下载数
    """
    # 读取藏品数据
    with open(artifacts_file, 'r', encoding='utf-8') as f:
        artifacts_data = json.load(f)
    
    # 准备图片目录
    images_dir = Path(output_dir)
    images_dir.mkdir(exist_ok=True, parents=True)
    
    # 提取需要下载的图片URL
    images_to_download = []
    for artifact in artifacts_data.get("artifacts", []):
        if artifact.get("image"):
            # 从URL中提取文件名
            image_url = artifact["image"]
            if "/" in image_url:
                filename = image_url.split("/")[-1]
            else:
                # 如果无法从URL提取文件名，使用藏品ID作为文件名
                extension = ".jpg"  # 默认扩展名
                filename = f"artifact_{artifact.get('id', 'unknown')}{extension}"
            
            save_path = images_dir / filename
            
            # 更新藏品数据中的本地图片路径
            artifact["localImage"] = str(images_dir.name / filename)
            
            # 添加到下载列表
            images_to_download.append((image_url, str(save_path)))
    
    # 并发下载图片
    print(f"开始下载 {len(images_to_download)} 张图片...")
    
    success_count = 0
    failed_count = 0
    
    with concurrent.futures.ThreadPoolExecutor(max_workers=max_workers) as executor:
        # 提交所有下载任务
        future_to_url = {
            executor.submit(download_image, url, path): url 
            for url, path in images_to_download
        }
        
        # 处理任务结果
        for future in tqdm(concurrent.futures.as_completed(future_to_url), total=len(images_to_download), desc="下载进度"):
            url = future_to_url[future]
            try:
                success = future.result()
                if success:
                    success_count += 1
                else:
                    failed_count += 1
            except Exception as e:
                print(f"任务异常: {url} - {str(e)}")
                failed_count += 1
    
    print(f"下载完成！成功: {success_count}, 失败: {failed_count}")
    
    # 更新藏品数据中的本地图片路径
    updated_artifacts_file = Path(artifacts_file).with_suffix(".updated.json")
    with open(updated_artifacts_file, 'w', encoding='utf-8') as f:
        json.dump(artifacts_data, f, ensure_ascii=False, indent=2)
    
    print(f"更新后的藏品数据已保存到: {updated_artifacts_file}")
    
    return updated_artifacts_file

def main():
    # 解析命令行参数
    parser = argparse.ArgumentParser(description="下载藏品图片")
    parser.add_argument("--artifacts-file", required=True, help="藏品JSON文件路径")
    parser.add_argument("--output-dir", default="museum_images", help="图片保存目录")
    parser.add_argument("--max-workers", type=int, default=5, help="最大并发下载数")
    
    args = parser.parse_args()
    
    # 处理藏品图片
    process_artifacts_images(
        args.artifacts_file,
        args.output_dir,
        args.max_workers
    )

if __name__ == "__main__":
    main() 