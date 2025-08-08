const http = require('http');

function checkServer(port, path) {
  return new Promise((resolve) => {
    const options = {
      hostname: 'localhost',
      port: port,
      path: path,
      method: 'GET',
      timeout: 2000
    };

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => {
        resolve({
          success: true,
          status: res.statusCode,
          data: data
        });
      });
    });

    req.on('error', (error) => {
      resolve({
        success: false,
        error: error.message
      });
    });

    req.on('timeout', () => {
      req.destroy();
      resolve({
        success: false,
        error: 'Request timeout'
      });
    });

    req.end();
  });
}

async function runHealthCheck() {
  console.log('🏥 Running health check...\n');

  // Check backend
  console.log('🔍 Checking backend server (port 3001)...');
  const backendHealth = await checkServer(3001, '/api/health');
  if (backendHealth.success) {
    console.log('✅ Backend server is running');
    console.log(`   Status: ${backendHealth.status}`);
    try {
      const healthData = JSON.parse(backendHealth.data);
      console.log(`   Response: ${healthData.status} - ${healthData.version}`);
    } catch (e) {
      console.log(`   Response: ${backendHealth.data.substring(0, 100)}`);
    }
  } else {
    console.log('❌ Backend server is not accessible');
    console.log(`   Error: ${backendHealth.error}`);
  }

  // Check frontend
  console.log('\n🔍 Checking frontend server (port 3000)...');
  const frontendHealth = await checkServer(3000, '/');
  if (frontendHealth.success) {
    console.log('✅ Frontend server is running');
    console.log(`   Status: ${frontendHealth.status}`);
  } else {
    console.log('❌ Frontend server is not accessible');
    console.log(`   Error: ${frontendHealth.error}`);
  }

  console.log('\n📝 Next steps:');
  if (!backendHealth.success) {
    console.log('   1. Start backend: cd backend && npm start');
  }
  if (!frontendHealth.success) {
    console.log('   2. Start frontend: cd frontend && npm start');
  }
  if (backendHealth.success && frontendHealth.success) {
    console.log('   ✅ Both servers are running. Try the login again.');
    console.log('   🔐 Credentials: arctic_admin / password123');
  }
}

runHealthCheck();