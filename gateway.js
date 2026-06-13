const http = require('http');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const PORT = 18795; // Public port for Olimp Dashboard
const BACKEND_PORT = 3001; // Port where the Express backend runs
const AUTH_PATH = path.join(__dirname, 'auth.json');
const CLIENT_DIST_DIR = path.join(__dirname, 'client', 'dist');

const activeSessions = new Set();

// Initialize auth config with random password if it doesn't exist
if (!fs.existsSync(AUTH_PATH)) {
  const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let randPassword = '';
  for (let i = 0; i < 12; i++) {
    randPassword += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  fs.writeFileSync(AUTH_PATH, JSON.stringify({ username: 'admin', password: randPassword }, null, 2));
  console.log(`[AUTH] Created default auth.json with username: admin and password: ${randPassword}`);
}

function getCookie(req, name) {
  const list = {};
  const rc = req.headers.cookie;
  if (rc) {
    rc.split(';').forEach(cookie => {
      const parts = cookie.split('=');
      list[parts.shift().trim()] = decodeURI(parts.join('='));
    });
  }
  return list[name];
}

function isAuthenticated(req) {
  const token = getCookie(req, 'OlimpSessionToken');
  return token && activeSessions.has(token);
}

function sendJSON(res, data, status = 200) {
  res.writeHead(status, { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' });
  res.end(JSON.stringify(data));
}

function sendError(res, message, status = 500) {
  sendJSON(res, { error: message }, status);
}

const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.mjs': 'application/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.ttf': 'font/ttf',
  '.otf': 'font/otf'
};

const server = http.createServer((req, res) => {
  const url = new URL(req.url, `http://${req.headers.host}`);
  const method = req.method;

  // Handle CORS preflight
  if (method === 'OPTIONS') {
    res.writeHead(204, {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS, PUT, DELETE, PATCH',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    });
    res.end();
    return;
  }

  const isApiRoute = url.pathname.startsWith('/api/');
  const isUploadsRoute = url.pathname.startsWith('/uploads/');
  const isLoginRoute = url.pathname === '/api/login';
  const isLogoutRoute = url.pathname === '/api/logout';

  // Allow login/logout endpoints without authentication
  if ((isApiRoute || isUploadsRoute) && !isLoginRoute && !isLogoutRoute) {
    if (!isAuthenticated(req)) {
      return sendError(res, 'Unauthorized', 401);
    }
  }

  // --- API Authentication Endpoint ---
  if (method === 'POST' && isLoginRoute) {
    let body = '';
    req.on('data', chunk => body += chunk);
    req.on('end', () => {
      try {
        const payload = JSON.parse(body);
        let authConfig;
        try {
          authConfig = JSON.parse(fs.readFileSync(AUTH_PATH, 'utf8'));
        } catch (e) {
          return sendError(res, 'Error reading auth config: ' + e.message, 500);
        }

        if (payload.username === authConfig.username && payload.password === authConfig.password) {
          const token = crypto.randomBytes(32).toString('hex');
          activeSessions.add(token);

          res.writeHead(200, {
            'Content-Type': 'application/json',
            'Set-Cookie': `OlimpSessionToken=${token}; HttpOnly; Path=/; Max-Age=2592000; SameSite=Lax`
          });
          res.end(JSON.stringify({ success: true }));
        } else {
          sendError(res, 'Неверное имя пользователя или пароль', 401);
        }
      } catch (e) {
        sendError(res, 'Invalid JSON payload: ' + e.message, 400);
      }
    });
    return;
  }

  // --- API Logout Endpoint ---
  if (method === 'POST' && isLogoutRoute) {
    const token = getCookie(req, 'OlimpSessionToken');
    if (token) {
      activeSessions.delete(token);
    }
    res.writeHead(200, {
      'Content-Type': 'application/json',
      'Set-Cookie': 'OlimpSessionToken=; HttpOnly; Path=/; Expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Lax'
    });
    res.end(JSON.stringify({ success: true }));
    return;
  }

  // --- API / Uploads Proxying ---
  if (isApiRoute || isUploadsRoute) {
    const proxyReq = http.request({
      host: '127.0.0.1',
      port: BACKEND_PORT,
      path: req.url,
      method: req.method,
      headers: req.headers
    }, (proxyRes) => {
      res.writeHead(proxyRes.statusCode, proxyRes.headers);
      proxyRes.pipe(res);
    });

    req.pipe(proxyReq);

    proxyReq.on('error', (err) => {
      console.error('[PROXY ERROR]', err.message);
      sendError(res, 'Backend connection failed: ' + err.message, 502);
    });
    return;
  }

  // --- Static Client Serving ---
  if (!isAuthenticated(req)) {
    // Serve login page if not logged in
    fs.readFile(path.join(__dirname, 'login.html'), 'utf8', (err, html) => {
      if (err) {
        res.writeHead(500, { 'Content-Type': 'text/plain' });
        res.end('Error loading login page: ' + err.message);
      } else {
        res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
        res.end(html);
      }
    });
    return;
  }

  // Serve static files from client/dist
  let filePath = path.join(CLIENT_DIST_DIR, url.pathname);
  
  // If requesting root or directory, check for index.html
  if (url.pathname === '/' || url.pathname.endsWith('/')) {
    filePath = path.join(filePath, 'index.html');
  }

  fs.stat(filePath, (err, stats) => {
    if (err || !stats.isFile()) {
      // SPA Fallback: If static file doesn't exist, serve client/dist/index.html
      const fallbackPath = path.join(CLIENT_DIST_DIR, 'index.html');
      fs.readFile(fallbackPath, 'utf8', (fallbackErr, html) => {
        if (fallbackErr) {
          res.writeHead(500, { 'Content-Type': 'text/plain' });
          res.end('Error loading fallback index.html: ' + fallbackErr.message);
        } else {
          res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
          res.end(html);
        }
      });
      return;
    }

    const ext = path.extname(filePath).toLowerCase();
    const contentType = MIME_TYPES[ext] || 'application/octet-stream';

    res.writeHead(200, { 'Content-Type': contentType });
    const stream = fs.createReadStream(filePath);
    stream.pipe(res);
  });
});

server.listen(PORT, () => {
  console.log(`[GATEWAY] Olimp Dashboard proxy listening on http://localhost:${PORT}`);
});
