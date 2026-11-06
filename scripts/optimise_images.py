
from pathlib import Path
from PIL import Image

# Folder containing the original photographs
source_folder = Path("/Users/space/Desktop/AWS project")

# Folder where optimised photographs will be saved
output_folder = Path(__file__).resolve().parent.parent / "website" / "images"

# Create the output folder if it doesn't exist
output_folder.mkdir(parents=True, exist_ok=True)

print("Source folder:", source_folder)
print("Output folder:", output_folder)

print("Source exists:", source_folder.exists())
print("Number of files:", len(list(source_folder.iterdir())) if source_folder.is_dir() else 0)


# Supported image formats
supported_formats = {".jpg", ".jpeg", ".png", ".heic", ".webp"}

# Find photographs in the source folder
photos = [
    file for file in source_folder.iterdir()
    if file.is_file() and file.suffix.lower() in supported_formats
]

print(f"Found {len(photos)} photographs")

# Process each photograph
for photo in photos:
    with Image.open(photo) as image:

        # Correct orientation using EXIF metadata
        from PIL import ImageOps
        image = ImageOps.exif_transpose(image)

        # Resize while preserving proportions
        image.thumbnail((2000, 2000))

        # Convert to RGB for WebP compatibility
        image = image.convert("RGB")

        # Create the output filename
        output_file = output_folder / f"{photo.stem}.webp"

        # Save the optimised photograph
        image.save(output_file, "WEBP", quality=85)

        print(f"Optimised: {photo.name} -> {output_file.name}")

print("Image optimisation complete!")
