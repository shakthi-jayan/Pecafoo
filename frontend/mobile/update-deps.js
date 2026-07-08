const fs = require('fs');

const files = [
  'frontend/mobile/package.json',
  'frontend/mobile/apps/admin/package.json',
  'frontend/mobile/apps/customer/package.json',
  'frontend/mobile/apps/delivery/package.json',
  'frontend/mobile/apps/restaurant/package.json',
  'frontend/mobile/packages/api/package.json',
  'frontend/mobile/packages/auth/package.json',
  'frontend/mobile/packages/storage/package.json',
  'frontend/mobile/packages/theme/package.json',
  'frontend/mobile/packages/ui/package.json',
  'frontend/mobile/packages/utils/package.json'
];

const updates = {
  '@react-native-async-storage/async-storage': '2.1.2',
  'expo-auth-session': '~6.2.1',
  'expo-location': '~18.1.6',
  'expo-web-browser': '~14.2.0',
  'expo-updates': '~0.28.18',
  'react': '19.0.0',
  'react-dom': '19.0.0',
  'react-test-renderer': '19.0.0',
  'react-native': '0.79.6',
  'react-native-safe-area-context': '5.4.0',
  'react-native-screens': '~4.11.1',
  '@sentry/react-native': '~6.14.0',
  '@expo/config-plugins': '~10.1.1'
};

for (const file of files) {
  try {
    const data = JSON.parse(fs.readFileSync(file, 'utf8'));
    let changed = false;
    
    ['dependencies', 'devDependencies', 'peerDependencies'].forEach(deptype => {
      if (data[deptype]) {
        for (const [pkg, newVer] of Object.entries(updates)) {
          if (data[deptype][pkg] && data[deptype][pkg] !== newVer) {
            console.log('Updated ' + pkg + ' in ' + file + ': ' + data[deptype][pkg] + ' -> ' + newVer);
            data[deptype][pkg] = newVer;
            changed = true;
          }
        }
      }
    });

    if (changed) {
      fs.writeFileSync(file, JSON.stringify(data, null, 2) + '\n');
    }
  } catch (err) {
    console.error('Failed ' + file + ': ' + err.message);
  }
}
