import os

def extract_details(file_path):
    with open(file_path, "r", encoding="utf-8") as f:
        content = f.read()
    
    pages = content.split("--- Page ")
    details = []
    
    for page in pages:
        if not page.strip():
            continue
        lines = [line.strip() for line in page.split("\n") if line.strip()]
        if not lines:
            continue
        page_num = lines[0].split(" ---")[0]
        
        # We search for slides that contain technical terms or bullet points
        important_lines = []
        for line in lines[1:]:
            # Look for mathematical symbols, definitions, or specific terms
            if any(kw in line for kw in [
                "エントロピー", "行列", "偏微分", "逆行列", "微分", "傾き", "決定木", 
                "回帰", "主成分", "寄与率", "フレーム問題", "シンボルグラウンディング",
                "チューリング", "イライザ", "ダートマス", "ムーア", "パーセプトロン",
                "探索", "推論", "組合せ爆発", "パズル", "状態空間"
            ]) or (line.startswith(("•", "・", "●", "■")) and len(line) > 5):
                important_lines.append(line)
        
        if important_lines:
            details.append((page_num, lines[1], important_lines))
            
    return details

def main():
    target_dir = "/Users/hondahikaru/試験対策ポータル/知識工学テスト/extracted_texts"
    files = sorted([f for f in os.listdir(target_dir) if f.endswith(".txt")])
    
    for file in files:
        print(f"\n==================== DETAILS: {file} ====================")
        full_path = os.path.join(target_dir, file)
        details = extract_details(full_path)
        for page_num, title, lines in details:
            print(f"Page {page_num}: {title}")
            for l in lines[:4]: # show up to 4 lines
                print(f"  - {l}")

if __name__ == "__main__":
    main()
