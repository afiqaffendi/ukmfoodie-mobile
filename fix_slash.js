const fs = require('fs');
const path = require('path');

const dir = 'c:\\xampp\\htdocs\\ukmfoodie_workspace\\ukmfoodie-mobile\\screens';
const files = [
  'CategoryItemsScreen.js',
  'ChatScreen.js',
  'CheckoutScreen.js',
  'LocationSearchScreen.js',
  'MenuScreen.js',
  'OrderStatusScreen.js'
];

for (let file of files) {
  const filePath = path.join(dir, file);
  if (fs.existsSync(filePath)) {
    let content = fs.readFileSync(filePath, 'utf8');
    if (content.includes('\\n});')) {
      content = content.replace('\\n});', '\n});');
      fs.writeFileSync(filePath, content, 'utf8');
      console.log('Fixed slash ' + file);
    }
  }
}
