import { createServer } from 'node:http';
import { URL } from 'node:url';

const port = 54322;

function sendJson(response, status, value) {
  response.writeHead(status, {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET,HEAD,POST,PATCH,DELETE,OPTIONS',
    'Access-Control-Allow-Headers': 'apikey,authorization,content-type,x-client-info,prefer,range,accept-profile,content-profile',
    'Access-Control-Expose-Headers': 'content-range,content-profile',
    'Cache-Control': 'no-store',
    'Content-Type': 'application/json; charset=utf-8',
  });
  response.end(JSON.stringify(value));
}

const server = createServer((request, response) => {
  if (request.method === 'OPTIONS') {
    response.writeHead(204, {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET,HEAD,POST,PATCH,DELETE,OPTIONS',
      'Access-Control-Allow-Headers': 'apikey,authorization,content-type,x-client-info,prefer,range,accept-profile,content-profile',
    });
    response.end();
    return;
  }

  const path = new URL(request.url ?? '/', `http://127.0.0.1:${port}`).pathname;
  if (path === '/health') {
    sendJson(response, 200, { ok: true });
  } else if (path.startsWith('/rest/v1/')) {
    response.setHeader('Content-Range', '*/0');
    sendJson(response, request.method === 'POST' ? 201 : 200, []);
  } else if (path.startsWith('/auth/v1/')) {
    sendJson(response, 200, {});
  } else if (path.startsWith('/storage/v1/')) {
    sendJson(response, 200, {});
  } else {
    sendJson(response, 404, { message: 'Unknown E2E mock endpoint.' });
  }
});

server.listen(port, '127.0.0.1');
