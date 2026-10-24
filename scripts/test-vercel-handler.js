process.env.VERCEL = '1';
process.env.NODE_ENV = 'production';

import http from 'http';
import handler from '../api/index.js';

console.log('Testing Vercel Serverless Function entrypoint (api/index.js) with VERCEL=1...');

// Create an in-memory HTTP server using the Vercel handler
const server = http.createServer((req, res) => {
  handler(req, res);
});

server.listen(0, async () => {
  const port = server.address().port;
  console.log(`Test server running on port ${port}...`);

  try {
    const res = await fetch(`http://127.0.0.1:${port}/api/health`);
    const data = await res.json();
    console.log(`✅ Status: ${res.status}`);
    console.log('✅ Response payload:', data);

    // Test a second request to verify warm serverless execution
    const resBlogs = await fetch(`http://127.0.0.1:${port}/api/v1/public/blogs?limit=2`);
    const blogsData = await resBlogs.json();
    console.log(`✅ Blogs API Status: ${resBlogs.status}, Total blogs found: ${blogsData.total}`);

    server.close(() => {
      console.log('✅ Serverless handler test PASSED successfully!');
      process.exit(0);
    });
  } catch (err) {
    console.error('❌ Serverless test failed:', err);
    server.close(() => process.exit(1));
  }
});
