import os
import re

directory = r'c:\xampp\htdocs\ukmfoodie_workspace\ukmfoodie-mobile\screens'
files = [
    'AIChatScreen.js',
    'CartScreen.js',
    'CategoryItemsScreen.js',
    'ChatScreen.js',
    'CheckoutScreen.js',
    'LocationSearchScreen.js',
    'MenuScreen.js',
    'OrderStatusScreen.js'
]

jsx = """
      {/* STATIC ABSTRACT BACKGROUND (Diagonal Lines Pattern) */}
      <View style={styles.staticBackground}>
        <View style={styles.staticLine1} />
        <View style={styles.staticLine2} />
        <View style={styles.staticLine3} />
        <View style={styles.staticLine4} />
        <View style={styles.staticLine5} />
      </View>
"""

styles_str = """
  // Static Abstract Background
  staticBackground: {
    ...StyleSheet.absoluteFillObject,
    overflow: 'hidden',
    zIndex: -1,
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
});
"""

for f in files:
    path = os.path.join(directory, f)
    if not os.path.exists(path): continue
    
    with open(path, 'r', encoding='utf8') as file:
        content = file.read()
        
    if 'STATIC ABSTRACT BACKGROUND' in content and 'staticLine1' in content:
        # Check if styles were appended
        if 'staticBackground:' not in content:
            # Append styles
            content = re.sub(r'\}\);?\s*$', styles_str, content)
            with open(path, 'w', encoding='utf8') as file:
                file.write(content)
            print(f"Appended styles to {f}")
        else:
            print(f"Skipping {f}")
        continue
        
    inserted = False
    if '<StatusBar style="dark" />' in content:
        content = content.replace('<StatusBar style="dark" />', '<StatusBar style="dark" />' + jsx, 1)
        inserted = True
    elif '<StatusBar style="light" />' in content:
        content = content.replace('<StatusBar style="light" />', '<StatusBar style="light" />' + jsx, 1)
        inserted = True
    elif '<View style={styles.container}>' in content:
        content = content.replace('<View style={styles.container}>', '<View style={styles.container}>' + jsx, 1)
        inserted = True
    elif '<SafeAreaView style={styles.container}>' in content:
        content = content.replace('<SafeAreaView style={styles.container}>', '<SafeAreaView style={styles.container}>' + jsx, 1)
        inserted = True
        
    if inserted:
        # replace the last });
        content = re.sub(r'\}\);?\s*$', styles_str, content)
        with open(path, 'w', encoding='utf8') as file:
            file.write(content)
        print(f"Updated {f}")
    else:
        print(f"Failed to find insertion point in {f}")
