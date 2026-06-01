import os
from pypdf import PdfReader

def extract_text_from_pdf(pdf_path):
    try:
        reader = PdfReader(pdf_path)
        text = ""
        for i, page in enumerate(reader.pages):
            page_text = page.extract_text()
            if page_text:
                text += f"\n--- Page {i+1} ---\n" + page_text
        return text
    except Exception as e:
        return f"Error reading {pdf_path}: {e}"

def main():
    target_dir = "/Users/hondahikaru/試験対策ポータル/知識工学テスト"
    pdf_files = [f for f in os.listdir(target_dir) if f.endswith(".pdf") and "知識工学" in f]
    pdf_files.sort()
    
    output_dir = "/Users/hondahikaru/試験対策ポータル/知識工学テスト/extracted_texts"
    os.makedirs(output_dir, exist_ok=True)
    
    for pdf in pdf_files:
        full_path = os.path.join(target_dir, pdf)
        print(f"Extracting {pdf}...")
        text = extract_text_from_pdf(full_path)
        
        txt_filename = pdf.replace(".pdf", ".txt")
        output_path = os.path.join(output_dir, txt_filename)
        with open(output_path, "w", encoding="utf-8") as f:
            f.write(text)
        print(f"Saved to {txt_filename}")

if __name__ == "__main__":
    main()
