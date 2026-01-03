import sys
from PIL import Image
import os

def main():
    overrideSplit = 0
    if len(sys.argv) != 3:
        os.system("clear")
        overrideSplit = int(input("Split: "))

    image_path = sys.argv[1]
    parts = 0
    if overrideSplit > 0:
        parts = overrideSplit
    else: 
        parts = int(sys.argv[2])

    if parts <= 0:
        print("Parts must be > 0")
        sys.exit(1)

    img = Image.open(image_path)
    width, height = img.size

    part_width = width // parts

    print(f"# Image Width: {width}")
    print(f"# Image Height: {height}")
    print(f"# Parts: {parts}")
    print("\nSplitted To:")

    base_name, ext = os.path.splitext(image_path)

    for i in range(parts):
        left = i * part_width
        right = width if i == parts - 1 else (i + 1) * part_width

        crop = img.crop((left, 0, right, height))
        out_name = f"out/{base_name}{i}{ext}"
        crop.save(out_name)

        print(f"{out_name} -> width: {right - left}, height: {height}")

if __name__ == "__main__":
    main()
