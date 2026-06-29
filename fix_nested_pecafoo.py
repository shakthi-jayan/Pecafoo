import os
import re

def process_directory(directory):
    for root, _, files in os.walk(directory):
        for file in files:
            filepath = os.path.join(root, file)
            if file.endswith(('.js', '.jsx', '.css')):
                with open(filepath, 'r', encoding='utf-8') as f:
                    content = f.read()
                
                # Clean up any leftover ../ or ./ before @pecafoo
                # Example: ../../@pecafoo/shared-ui -> @pecafoo/shared-ui
                new_content = re.sub(r'(\.+/)+@pecafoo/shared-ui', '@pecafoo/shared-ui', content)

                if new_content != content:
                    print(f"Fixed nested path in {filepath}")
                    with open(filepath, 'w', encoding='utf-8') as f:
                        f.write(new_content)

process_directory('frontend/apps')
