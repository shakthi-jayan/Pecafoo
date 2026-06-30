import os
import re

apps = ['customer-app', 'restaurant-app', 'delivery-app', 'admin-app']
base_path = r'c:\Users\Machodev\Documents\Pecafoo\frontend'

for app in apps:
    path = os.path.join(base_path, app, 'src', 'shared-ui', 'components', 'Inputs.jsx')
    if os.path.exists(path):
        with open(path, 'r', encoding='utf-8') as f:
            content = f.read()
            
        replacement = """const [hasValue, setHasValue] = useState(props.value || props.defaultValue ? true : false);

  React.useEffect(() => {
    if (props.value !== undefined) {
      setHasValue(String(props.value).length > 0);
    }
  }, [props.value]);"""
        
        # Replace only the first occurrence in FloatingInput
        content = re.sub(
            r'const \[hasValue, setHasValue\] = useState\(props\.value \|\| props\.defaultValue \? true : false\);',
            replacement,
            content,
            count=1
        )
        
        with open(path, 'w', encoding='utf-8') as f:
            f.write(content)

print("Inputs patched")
