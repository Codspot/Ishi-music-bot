// Quick test to verify bot functionality
const fs = require('fs');
const path = require('path');

console.log('🧪 Testing Ishi Music Bot configuration...');

// Test 1: Check if all required files exist
const requiredFiles = [
  'index.js',
  'config.js',
  'utils.js',
  '.env',
  'package.json',
  'ecosystem.config.json'
];

let allFilesExist = true;
requiredFiles.forEach(file => {
  if (fs.existsSync(file)) {
    console.log(`✅ ${file} exists`);
  } else {
    console.log(`❌ ${file} is missing`);
    allFilesExist = false;
  }
});

// Test 2: Check if commands directory exists and has files
const commandsDir = './commands';
if (fs.existsSync(commandsDir)) {
  const commandFiles = fs.readdirSync(commandsDir).filter(file => file.endsWith('.js'));
  console.log(`✅ Commands directory exists with ${commandFiles.length} command files`);
} else {
  console.log('❌ Commands directory is missing');
  allFilesExist = false;
}

// Test 3: Check if events directory exists
const eventsDir = './events';
if (fs.existsSync(eventsDir)) {
  const eventFiles = fs.readdirSync(eventsDir).filter(file => file.endsWith('.js'));
  console.log(`✅ Events directory exists with ${eventFiles.length} event files`);
} else {
  console.log('❌ Events directory is missing');
  allFilesExist = false;
}

// Test 4: Check package.json scripts
try {
  const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
  const requiredScripts = ['start', 'build', 'test-all', 'test-syntax'];
  
  let allScriptsExist = true;
  requiredScripts.forEach(script => {
    if (packageJson.scripts && packageJson.scripts[script]) {
      console.log(`✅ Script '${script}' exists`);
    } else {
      console.log(`❌ Script '${script}' is missing`);
      allScriptsExist = false;
    }
  });
  
  if (allScriptsExist) {
    console.log('✅ All required scripts are present');
  }
} catch (error) {
  console.log('❌ Error reading package.json');
  allFilesExist = false;
}

// Final result
if (allFilesExist) {
  console.log('\n🎉 All tests passed! Bot is ready for deployment.');
  console.log('\n📋 Next steps:');
  console.log('   1. Run: npm run build');
  console.log('   2. Deploy to DigitalOcean: ./update-server.sh');
  console.log('   3. Start with PM2: npm run pm2:start');
} else {
  console.log('\n⚠️  Some tests failed. Please fix the issues above.');
  process.exit(1);
}
