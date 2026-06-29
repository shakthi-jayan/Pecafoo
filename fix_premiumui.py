import re

path = 'frontend/packages/shared-ui/PremiumUI.jsx'
with open(path, 'r', encoding='utf-8') as f:
    content = f.read()

content = content.replace(\"export * from './components/Layout';\", \"export * from './components/layout/index';\")
content = content.replace(\"export * from './components/Actions';\", \"export * from './components/actions/index';\")
content = content.replace(\"export * from './components/Inputs';\", \"export * from './components/forms/index';\")
content = content.replace(\"export * from './components/Navigation';\", \"export * from './components/navigation/index';\")
content = content.replace(\"export * from './components/Feedback';\", \"export * from './components/feedback/index';\")
content = content.replace(\"export * from './components/DataDisplay';\", \"export * from './components/data-display/index';\")

content = content.replace(\"from './components/Layout';\", \"from './components/layout/index';\")
content = content.replace(\"from './components/DataDisplay';\", \"from './components/data-display/index';\")

with open(path, 'w', encoding='utf-8') as f:
    f.write(content)
