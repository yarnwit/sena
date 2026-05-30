import os
import re

directory = r"c:\Users\User\Documents\GitHub\sena\frontend\app"

files_with_token = []

for root, _, files in os.walk(directory):
    for file in files:
        if file.endswith(".tsx") or file.endswith(".ts"):
            path = os.path.join(root, file)
            with open(path, 'r', encoding='utf-8') as f:
                content = f.read()
                if "localStorage.getItem" in content and "accessToken" in content:
                    files_with_token.append(path)

print(f"Found {len(files_with_token)} files using localStorage for accessToken.")
for f in files_with_token:
    print(f)
