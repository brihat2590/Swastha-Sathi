import os
from github import Github
import google.generativeai as genai

# ENV variables from GitHub Actions
GITHUB_TOKEN = os.getenv("GITHUB_TOKEN")
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
REPO_NAME = os.getenv("REPO")
PR_NUMBER = int(os.getenv("PR_NUMBER"))

# Configure Gemini
genai.configure(api_key=GEMINI_API_KEY)
model = genai.GenerativeModel("gemini-2.0-flash")

# Initialize GitHub client
gh = Github(GITHUB_TOKEN)
repo = gh.get_repo(REPO_NAME)
pr = repo.get_pull(PR_NUMBER)

# Fetch diff
diff = pr.get_files()
diff_text = ""

for file in diff:
    filename = file.filename
    patch = file.patch or ""
    diff_text += f"### File: {filename}\n```diff\n{patch}\n```\n\n"

# Generate review
prompt = f"""
You are a senior software engineer.
Review this pull request diff and give improvements in categories:
- Code Quality
- Bug Risks
- Security
- Performance
- Best Practices

Write response in Markdown.

{diff_text}
"""

response = model.generate_content(prompt)
feedback = response.text

# Post review
pr.create_issue_comment(feedback)
print("Review posted!")
