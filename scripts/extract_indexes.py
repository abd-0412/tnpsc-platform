import os
import pypdf

books_dir = r"D:\TNPSC Platform\Tamil Books"
output_file = r"D:\TNPSC Platform\scripts\extracted_indexes.txt"

files = [
    "6th Tamil - Term 1.pdf",
    "6th Tamil - Term 2.pdf",
    "6th Tamil - Term 3.pdf",
    "7th Tamil - Term 1.pdf",
    "7th Tamil - Term 2.pdf",
    "7th Tamil - Term 3.pdf",
    "8th Tamil.pdf",
    "9th Tamil.pdf",
    "10th Tamil.pdf",
    "11th Tamil.pdf",
    "12th Tamil.pdf"
]

with open(output_file, "w", encoding="utf-8") as out:
    for f in files:
        file_path = os.path.join(books_dir, f)
        if not os.path.exists(file_path):
            out.write(f"=== {f} NOT FOUND ===\n\n")
            continue
        
        out.write(f"=====================================================\n")
        out.write(f"FILE: {f}\n")
        out.write(f"=====================================================\n")
        
        try:
            reader = pypdf.PdfReader(file_path)
            num_pages = len(reader.pages)
            # Scan first 10 pages for Index / பொருளடக்கம்
            for page_num in range(min(12, num_pages)):
                text = reader.pages[page_num].extract_text()
                if "பொருளடக்கம்" in text or "வரிசை" in text or "இயல்" in text or "பக்கம்" in text:
                    out.write(f"--- PAGE {page_num + 1} ---\n")
                    out.write(text + "\n\n")
        except Exception as e:
            out.write(f"Error reading {f}: {str(e)}\n\n")

print(f"Extraction complete! Saved to {output_file}")

