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
    content = content.replace(/\}([\s\n]*\/\/\s*Static Abstract Background)/g, '},$1');
    fs.writeFileSync(filePath, content, 'utf8');
    console.log('Fixed ' + file);
  }
}
