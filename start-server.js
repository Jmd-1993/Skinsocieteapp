const { spawn } = require('child_process');
const http = require('http');

console.log('🚀 Starting Skin Societe Development Server...');

// Start Next.js server
const nextServer = spawn('npx', ['next', 'dev', '--port', '3002'], {
  stdio: 'inherit',
  shell: true
});

// Create a simple proxy server to help with connectivity
const proxyServer = http.createServer((req, res) => {
  // Add CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    res.writeHead(200);
    res.end();
    return;
  }

  // Proxy to Next.js server
  const options = {
    hostname: 'localhost',
    port: 3002,
    path: req.url,
    method: req.method,
    headers: req.headers
  };

  const proxyReq = http.request(options, (proxyRes) => {
    res.writeHead(proxyRes.statusCode, proxyRes.headers);
    proxyRes.pipe(res);
  });

  proxyReq.on('error', (err) => {
    console.error('Proxy error:', err);
    res.writeHead(500);
    res.end('Proxy error - Next.js server may still be starting');
  });

  req.pipe(proxyReq);
});

// Start proxy on port 8080
proxyServer.listen(8080, '0.0.0.0', () => {
  console.log('\n✅ Servers are starting...');
  console.log('🌟 SKIN SOCIETE APP WILL BE AVAILABLE AT:');
  console.log('   → http://localhost:8080');
  console.log('   → http://127.0.0.1:8080');
  console.log('');
  console.log('⏱️  Please wait 30 seconds for full startup...');
  
  setTimeout(() => {
    console.log('\n🎉 YOUR BEAUTIFUL SKIN SOCIETE APP SHOULD NOW BE READY!');
    console.log('   Visit: http://localhost:8080');
  }, 10000);
});

// Handle cleanup
process.on('SIGINT', () => {
  console.log('\n🛑 Shutting down servers...');
  nextServer.kill();
  proxyServer.close();
  process.exit(0);
});