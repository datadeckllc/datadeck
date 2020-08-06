// server.js
const { createServer } = require('http');
const { parse } = require('url');
const next = require('next');

const dev = process.env.NODE_ENV !== 'production';
const app = next({ dev });
const handle = app.getRequestHandler();

const SERVER_TIMEOUT = 5 * 60 * 60 * 1000 // Hr * Min * Secs * Mill

app.prepare().then(() => {
    const server = createServer((req, res) => {
        // Be sure to pass `true` as the second argument to `url.parse`.
        // This tells it to parse the query portion of the URL.
        const parsedUrl = parse(req.url, true);
        const { pathname, query } = parsedUrl;

        if (pathname === '/a') { // Remove?
            app.render(req, res, '/a', query)
        } else if (pathname === '/b') { // Remove?
            app.render(req, res, '/b', query)
        } else {
            handle(req, res, parsedUrl)
        }
    });
        server.listen(3000, (err) => {
        if (err) throw err
        console.log('> Ready on http://localhost:3000')
    });
    server.timeout = SERVER_TIMEOUT;
})