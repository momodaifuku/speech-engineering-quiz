from PIL import Image
import os

def crop_section(image_path, y_start, y_end, output_path):
    if not os.path.exists(image_path):
        print(f"Error: {image_path} does not exist.")
        return False
        
    img = Image.open(image_path)
    width, height = img.size
    img_rgb = img.convert("RGB")
    
    left = width
    right = 0
    top = y_end
    bottom = y_start
    
    non_white_found = False
    
    for y in range(y_start, y_end):
        for x in range(0, width):
            r, g, b = img_rgb.getpixel((x, y))
            if r < 250 or g < 250 or b < 250:
                non_white_found = True
                if x < left: left = x
                if x > right: right = x
                if y < top: top = y
                if y > bottom: bottom = y
                
    if not non_white_found:
        print(f"No non-white region found in y range [{y_start}, {y_end}]")
        return False
        
    margin = 30
    left = max(0, left - margin)
    right = min(width, right + margin)
    top = max(y_start, top - margin)
    bottom = min(y_end, bottom + margin)
    
    print(f"Cropping [{left}, {top}, {right}, {bottom}]")
    cropped_img = img.crop((left, top, right, bottom))
    cropped_img.save(output_path)
    print(f"Saved to {output_path}")
    return True

if __name__ == "__main__":
    os.makedirs("extracted_images", exist_ok=True)
    crop_section("rendered_pages/page_7.png", 550, 1150, "extracted_images/q4_3_chart.png")
