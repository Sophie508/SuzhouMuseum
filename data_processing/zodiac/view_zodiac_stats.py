#!/usr/bin/env python3

import json
import argparse
import os
from rich.console import Console
from rich.table import Table
from rich import box
from rich.panel import Panel

def main():
    parser = argparse.ArgumentParser(description="查看生肖相关藏品统计信息")
    parser.add_argument("--input", default="data_processing/zodiac/data/zodiac_artifacts.json", help="生肖相关藏品数据文件路径")
    parser.add_argument("--examples", type=int, default=3, help="每个生肖显示的示例藏品数量")
    args = parser.parse_args()
    
    # 检查文件是否存在
    if not os.path.exists(args.input):
        print(f"错误: 找不到文件 {args.input}")
        return
    
    # 加载数据
    try:
        with open(args.input, 'r', encoding='utf-8') as f:
            data = json.load(f)
    except Exception as e:
        print(f"加载数据失败: {e}")
        return
    
    # 创建控制台对象
    console = Console()
    
    # 显示总体统计信息
    stats = data.get('stats', {})
    console.print(Panel(f"[bold green]生肖相关藏品统计信息[/bold green]", expand=False))
    console.print(f"总藏品数: [bold]{stats.get('totalArtifacts', 'N/A')}[/bold]")
    console.print(f"生肖相关藏品数: [bold]{stats.get('totalZodiacArtifacts', 'N/A')}[/bold]")
    console.print(f"覆盖率: [bold]{stats.get('totalZodiacArtifacts', 0) / stats.get('totalArtifacts', 1) * 100:.2f}%[/bold]")
    console.print()
    
    # 创建表格显示每个生肖的统计信息
    table = Table(title="各生肖相关藏品统计", box=box.ROUNDED)
    table.add_column("生肖", style="cyan")
    table.add_column("英文", style="green")
    table.add_column("藏品数量", justify="right", style="magenta")
    table.add_column("示例藏品", style="yellow")
    
    # 生肖中文名称映射
    zodiac_chinese = {
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
    
    # 获取所有藏品的映射
    artifacts_map = {a['id']: a for a in data.get('artifactsWithZodiac', [])}
    
    # 填充表格
    for zodiac, count in stats.get('countByZodiac', {}).items():
        # 获取该生肖的藏品ID列表
        artifact_ids = data.get('zodiacArtifacts', {}).get(zodiac, [])
        
        # 获取示例藏品
        examples = []
        for aid in artifact_ids[:args.examples]:
            artifact = artifacts_map.get(aid, {})
            name = artifact.get('name', 'N/A')
            period = artifact.get('period', '')
            if period:
                examples.append(f"{name}【{period}】")
            else:
                examples.append(name)
        
        # 添加到表格
        table.add_row(
            zodiac_chinese.get(zodiac, zodiac),
            zodiac,
            str(count),
            "\n".join(examples)
        )
    
    # 显示表格
    console.print(table)
    
    # 显示每个生肖的详细信息
    console.print("\n[bold]各生肖相关藏品详细信息[/bold]")
    
    for zodiac in zodiac_chinese:
        artifact_ids = data.get('zodiacArtifacts', {}).get(zodiac, [])
        if not artifact_ids:
            continue
            
        console.print(f"\n[bold cyan]{zodiac_chinese[zodiac]}[/bold cyan] ([green]{zodiac}[/green]) - 共 [magenta]{len(artifact_ids)}[/magenta] 件藏品")
        
        # 显示详细藏品列表
        detail_table = Table(box=box.SIMPLE)
        detail_table.add_column("ID")
        detail_table.add_column("名称")
        detail_table.add_column("朝代")
        
        for aid in artifact_ids[:10]:  # 限制显示前10个
            artifact = artifacts_map.get(aid, {})
            detail_table.add_row(
                aid,
                artifact.get('name', 'N/A'),
                artifact.get('period', 'N/A')
            )
        
        console.print(detail_table)
        if len(artifact_ids) > 10:
            console.print(f"... 还有 {len(artifact_ids) - 10} 件藏品未显示")

if __name__ == "__main__":
    main() 