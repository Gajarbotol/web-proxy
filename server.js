const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');
const bodyParser = require('body-parser');
const cheerio = require('cheerio');
const axios = require('axios');

const app = express();

app.use(bodyParser.text({ type: 'text/html' }));

// Middleware to handle rewriting of URLs in HTML content
app.use(async (req, res, next) => {
    try {
        // Fetch the target URL's content
        const targetUrl = 'http://en.oxtube.tv' + req.originalUrl;
        const response = await axios.get(targetUrl);

        // Check if content is HTML
        if (response.headers['content-type'] && response.headers['content-type'].includes('text/html')) {
            let $ = cheerio.load(response.data);

            // Rewrite all links and resources to go through your proxy
            $('a').each((_, el) => {
                let href = $(el).attr('href');
                if (href && href.startsWith('/')) {
                    $(el).attr('href', req.baseUrl + href); // Rewrite internal links
                }
            });

            $('img, script, link').each((_, el) => {
                let src = $(el).attr('src');
                let href = $(el).attr('href');
                if (src && src.startsWith('/')) {
                    $(el).attr('src', req.baseUrl + src); // Rewrite images, scripts
                }
                if (href && href.startsWith('/')) {
                    $(el).attr('href', req.baseUrl + href); // Rewrite CSS/JS files
                }
            });

            // Send modified HTML content
            res.send($.html());
        } else {
            // Non-HTML resources, just pipe through as-is
            axios({
                url: targetUrl,
                method: 'GET',
                responseType: 'stream',
            }).then(response => {
                res.set(response.headers);
                response.data.pipe(res);
            });
        }
    } catch (err) {
        next(err);
    }
});

// Proxy for other requests (CSS, JS, images)
app.use('/', createProxyMiddleware({
    target: 'http://en.oxtube.tv',
    changeOrigin: true,
    onProxyReq: (proxyReq, req, res) => {
        // Optional: Modify headers if needed
    }
}));

app.listen(3000, () => {
    console.log('Proxy server running on http://localhost:3000');
});
