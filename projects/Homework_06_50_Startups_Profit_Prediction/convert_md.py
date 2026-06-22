import markdown, webbrowser, os, sys

md = open('50SPP.md', encoding='utf-8').read()
html_body = markdown.markdown(md, extensions=['extra', 'admonition', 'tables', 'fenced_code', 'codehilite'])

template = '''<!DOCTYPE html>
<html lang="zh-TW">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>50 Startups Profit Prediction</title>
<style>
  body { font-family: 'Segoe UI', system-ui, sans-serif; max-width: 960px; margin: 0 auto; padding: 40px 24px; line-height: 1.7; color: #1a1a2e; background: #f8f9fa; }
  h1 { font-size: 2.2rem; color: #1E88E5; border-bottom: 3px solid #1E88E5; padding-bottom: 10px; }
  h2 { font-size: 1.6rem; color: #1565C0; margin-top: 40px; border-bottom: 1px solid #e0e0e0; padding-bottom: 6px; }
  h3 { font-size: 1.2rem; color: #333; margin-top: 28px; }
  table { border-collapse: collapse; width: 100%; margin: 16px 0; background: white; border-radius: 8px; overflow: hidden; box-shadow: 0 1px 4px rgba(0,0,0,0.08); }
  th, td { border: 1px solid #e0e0e0; padding: 10px 14px; text-align: left; }
  th { background: #1E88E5; color: white; font-weight: 600; }
  tr:nth-child(even) { background: #f5f7fa; }
  blockquote { background: #e3f2fd; border-left: 5px solid #1E88E5; padding: 16px 20px; margin: 16px 0; border-radius: 0 8px 8px 0; }
  code { background: #eef0f8; padding: 2px 6px; border-radius: 4px; font-size: 0.9em; }
  pre { background: #1a1a2e; color: #e0e0e0; padding: 16px 20px; border-radius: 8px; overflow-x: auto; }
  pre code { background: none; padding: 0; }
  .admonition { padding: 16px 20px; border-radius: 8px; margin: 16px 0; border-left: 5px solid; }
  .admonition.note { background: #e3f2fd; border-color: #1E88E5; }
  .admonition.warning { background: #fff3e0; border-color: #ff9800; }
  .admonition.caution { background: #fce4ec; border-color: #e53935; }
  .admonition-title { font-weight: 700; margin-bottom: 8px; }
  hr { border: none; border-top: 1px solid #e0e0e0; margin: 32px 0; }
  a { color: #1E88E5; text-decoration: none; }
  a:hover { text-decoration: underline; }
  ul, ol { padding-left: 24px; }
  li { margin-bottom: 6px; }
  strong { color: #1565C0; }
</style>
</head>
<body>
__CONTENT__
</body>
</html>'''

out = template.replace('__CONTENT__', html_body)
with open('50SPP.html', 'w', encoding='utf-8') as f:
    f.write(out)

abs_path = os.path.abspath('50SPP.html')
print(f'OK: {abs_path}')
