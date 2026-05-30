const fs = require('fs');
const path = require('path');

const dir = 'c:\\xampp\\htdocs\\ukmfoodie_workspace\\ukmfoodie-mobile\\screens';
const backgroundJSX = `
      {/* STATIC ABSTRACT BACKGROUND (Diagonal Lines Pattern) */}
      <View style={styles.staticBackground}>
        <View style={styles.staticLine1} />
        <View style={styles.staticLine2} />
        <View style={styles.staticLine3} />
        <View style={styles.staticLine4} />
        <View style={styles.staticLine5} />
      </View>
`;
const backgroundStyles = `
  // Static Abstract Background
  staticBackground: {
    ...StyleSheet.absoluteFillObject,
    overflow: 'hidden',
  },
  staticLine1: {
    position: 'absolute',
    top: 100,
    left: -150,
    width: 600,
    height: 40,
    backgroundColor: '#FFC93C',
    opacity: 0.12,
    transform: [{ rotate: '-45deg' }]
  },
  staticLine2: {
    position: 'absolute',
    top: 350,
    right: -250,
    width: 800,
    height: 55,
    backgroundColor: '#1A1A1A',
    opacity: 0.05,
    transform: [{ rotate: '-45deg' }]
  },
  staticLine3: {
    position: 'absolute',
    bottom: 250,
    left: -200,
    width: 700,
    height: 70,
    backgroundColor: '#FFC93C',
    opacity: 0.08,
    transform: [{ rotate: '-45deg' }]
  },
  staticLine4: {
    position: 'absolute',
    bottom: 0,
    right: -100,
    width: 500,
    height: 35,
    backgroundColor: '#1A1A1A',
    opacity: 0.06,
    transform: [{ rotate: '-45deg' }]
  },
  staticLine5: {
    position: 'absolute',
    top: -30,
    right: -50,
    width: 400,
    height: 25,
    backgroundColor: '#1A1A1A',
    opacity: 0.04,
    transform: [{ rotate: '-45deg' }]
  }
`;

function processFile(file) {
  const filePath = path.join(dir, file);
  if (!fs.existsSync(filePath)) return;
  let content = fs.readFileSync(filePath, 'utf8');
  if (content.includes('STATIC ABSTRACT BACKGROUND')) return;
  
  if (content.includes('<StatusBar style="dark" />')) {
    content = content.replace('<StatusBar style="dark" />', '<StatusBar style="dark" />' + backgroundJSX);
  } else if (content.includes('<View style={styles.header}>')) {
    content = content.replace('<View style={styles.header}>', backgroundJSX + '<View style={styles.header}>');
  } else if (content.includes('<View style={styles.headerContainer}>')) {
    content = content.replace('<View style={styles.headerContainer}>', backgroundJSX + '<View style={styles.headerContainer}>');
  }

  const lastIndex = content.lastIndexOf('});');
  if (lastIndex !== -1) {
     content = content.substring(0, lastIndex) + ',' + backgroundStyles + '\n});' + content.substring(lastIndex + 3);
     fs.writeFileSync(filePath, content, 'utf8');
     console.log('Added BG to ' + file);
  }
}

processFile('AIChatScreen.js');
processFile('CartScreen.js');

// Now make headers transparent
const files = [
  'CartScreen.js',
  'CustomerOrderScreen.js',
  'LocationSearchScreen.js',
  'CheckoutScreen.js',
  'CategoryItemsScreen.js',
  'CustomerProfileScreen.js',
  'AIChatScreen.js',
  'MenuScreen.js'
];

for (let file of files) {
  const filePath = path.join(dir, file);
  if (fs.existsSync(filePath)) {
    let content = fs.readFileSync(filePath, 'utf8');
    content = content.replace(/(header:\s*\{[^}]*backgroundColor:\s*)'#(?:FFF|FFFFFF)'/g, "$1'transparent'");
    content = content.replace(/(headerContainer:\s*\{[^}]*backgroundColor:\s*)'#(?:FFF|FFFFFF)'/g, "$1'transparent'");
    content = content.replace(/(tabsContainer:\s*\{[^}]*backgroundColor:\s*)'#(?:FFF|FFFFFF)'/g, "$1'transparent'");
    content = content.replace(/(topHeader:\s*\{[^}]*backgroundColor:\s*)'#(?:FFF|FFFFFF)'/g, "$1'transparent'");
    fs.writeFileSync(filePath, content, 'utf8');
  }
}
console.log('Made headers transparent');
