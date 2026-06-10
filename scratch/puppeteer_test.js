const puppeteer = require('puppeteer');
const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = 3000;

const server = http.createServer((req, res) => {
  let urlPath = req.url.split('?')[0];
  console.log('GET', urlPath);
  if (urlPath.startsWith('/api/')) {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    if (urlPath === '/api/login') return res.end(JSON.stringify({ ok: true, token: "test", role: "admin", user: {name:"Test"} }));
    if (urlPath === '/api/settings') return res.end(JSON.stringify({}));
    return res.end('[]');
  }
  let filePath = path.join(__dirname, '..', urlPath === '/' ? 'admin/index.html' : urlPath);
  if (!fs.existsSync(filePath)) {
    console.log('404 Not Found:', filePath);
    res.writeHead(404);
    res.end('Not found: ' + filePath);
    return;
  }
  const content = fs.readFileSync(filePath);
  let contentType = 'text/html';
  if (filePath.endsWith('.js')) contentType = 'application/javascript';
  else if (filePath.endsWith('.jsx')) contentType = 'text/babel';
  res.writeHead(200, { 'Content-Type': contentType });
  res.end(content);
});

server.listen(PORT, async () => {
  console.log('Server running on port ' + PORT);
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  
  page.on('console', msg => console.log('BROWSER CONSOLE (' + msg.type() + '):', msg.text()));
  page.on('pageerror', error => console.log('BROWSER ERROR:', error.message));
  
  await page.goto('https://maxwell-chi.vercel.app/admin/index.html');
  
  // try to login
  try {
    await page.waitForSelector('input[type="text"]', { timeout: 10000 });
    const typeofShippingEditor = await page.evaluate(() => typeof window.ShippingEditor);
    console.log('typeof window.ShippingEditor:', typeofShippingEditor);
    
    await page.type('input[type="text"]', 'faizan1405@gmail.com');
    await page.type('input[type="password"]', 'maxwell2024');
    await page.click('button[type="submit"]');
    
    // wait 2 seconds
    await new Promise(r => setTimeout(r, 2000));
    
    const patchRes = await page.evaluate(async () => {
      const res = await fetch('/api/settings?resource=categories', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${sessionStorage.getItem('ab_admin_token')}` },
        body: JSON.stringify({ id: 'household', status: 'inactive' })
      });
      return { ok: res.ok, status: res.status, body: await res.text() };
    });
    console.log('PATCH RES:', patchRes);
    
    const deleteRes = await page.evaluate(async () => {
      const res = await fetch('/api/settings?resource=categories', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${sessionStorage.getItem('ab_admin_token')}` },
        body: JSON.stringify({ id: 'household' })
      });
      return { ok: res.ok, status: res.status, body: await res.text() };
    });
    console.log('DELETE RES:', deleteRes);

  } catch(e) {
    console.log('Login failed', e.message);
  }
  
  await browser.close();
  server.close();
});
