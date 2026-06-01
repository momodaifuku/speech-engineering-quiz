import pypdf
import os

def extract_images():
    reader = pypdf.PdfReader("機械学習-中間.pdf")
    os.makedirs("extracted_images", exist_ok=True)
    
    for idx, page in enumerate(reader.pages):
        print(f"Extracting images from page {idx+1}...")
        for img_idx, image_file_object in enumerate(page.images):
            # Save the image
            name = f"page_{idx+1}_{img_idx+1}_{image_file_object.name}"
            # Ensure name doesn't contain bad characters
            name = "".join(c for c in name if c.isalnum() or c in "._-")
            path = os.path.join("extracted_images", name)
            with open(path, "wb") as fp:
                fp.write(image_file_object.data)
            print(f"Saved {path}")

if __name__ == "__main__":
    extract_images()
