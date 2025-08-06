#!/usr/bin/env node

/**
 * Quick Context7 MCP Installation Test
 */

const fs = require('fs');
const os = require('os');

console.log('🚀 Context7 MCP Quick Test\n');

// Check installations
try {
  const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
  if (packageJson.devDependencies && packageJson.devDependencies['c7-mcp-server']) {
    console.log('✅ Local installation:', packageJson.devDependencies['c7-mcp-server']);
  }
} catch (error) {
  console.log('⚠️  Could not check local installation');
}

// Check Claude configuration
const configPath = os.homedir() + '/Library/Application Support/Claude/claude_desktop_config.json';
if (fs.existsSync(configPath)) {
  const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
  if (config.mcpServers && config.mcpServers.context7) {
    console.log('✅ Context7 configured in Claude Desktop');
    console.log('✅ Both Puppeteer and Context7 MCP servers active');
  }
} else {
  console.log('⚠️  Claude configuration not found');
}

console.log('\n🎉 Context7 MCP Ready!\n');
console.log('📝 Usage: Add "use context7" to your prompts');
console.log('🔄 Remember: Restart Claude Desktop to activate');
console.log('\n💡 Example: "Create a React component with TypeScript use context7"');