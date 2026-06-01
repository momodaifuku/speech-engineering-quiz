import os
import re

def summarize_file(file_path):
    with open(file_path, "r", encoding="utf-8") as f:
        content = f.read()
    
    # Extract page numbers/slide headers
    pages = content.split("--- Page ")
    summary = []
    
    for page in pages:
        if not page.strip():
            continue
        lines = [line.strip() for line in page.split("\n") if line.strip()]
        if not lines:
            continue
        page_num = lines[0].split(" ---")[0]
        # Treat the first 1-2 lines as slide title candidates
        title_candidates = lines[1:3] if len(lines) > 2 else lines[1:]
        title = " / ".join(title_candidates)[:100]
        
        # Look for definitional sentences or bullet points with key concepts
        key_lines = []
        for line in lines:
            # Look for definitions like "Xとは", "Xは、", "●", "■", "★", "・"
            if any(term in line for term in ["とは", "定義", "分類", "特徴", "メリット", "デメリット", "方法", "ルール"]) or line.startswith(("●", "■", "★", "・", "①", "②", "③", "④")):
                if len(line) > 10 and len(line) < 150:
                    key_lines.append(line)
        
        summary.append({
            "page": page_num,
            "title": title,
            "key_lines": key_lines[:3] # top 3 key lines
        })
    return summary

def main():
    target_dir = "/Users/hondahikaru/試験対策ポータル/知識工学テスト/extracted_texts"
    files = sorted([f for f in os.listdir(target_dir) if f.endswith(".txt")])
    
    for file in files:
        print(f"\n==================== {file} ====================")
        full_path = os.path.join(target_dir, file)
        slides = summarize_file(full_path)
        
        # Print first few slide titles and key points
        for slide in slides[:10]: # show first 10 pages info
            print(f"Page {slide['page']}: {slide['title']}")
            for kl in slide['key_lines']:
                print(f"  - {kl}")

if __name__ == "__main__":
    main()
