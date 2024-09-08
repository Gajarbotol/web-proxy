const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');
const axios = require('axios');
const cheerio = require('cheerio'); // To parse and modify HTML

const app = express();

// Serve the HTML page containing the iframe
app.get('/', (req, res) => {
    res.sendFile(__dirname + '/index.html');
});

// Middleware to fetch and modify the content from the target website
app.get('/proxy*', async (req, res) => {
    try {
        const targetUrl = 'https://en.pornohd.blue/' + req.url.replace('/proxy', '');
        const response = await axios.get(targetUrl);

        // If the response is HTML, rewrite links
        if (response.headers['content-type'].includes('text/html')) {
            const $ = cheerio.load(response.data);

            // Rewrite all links to pass through the proxy
            $('a').each((_, el) => {
                const href = $(el).attr('href');
                if (href && href.startsWith('/')) {
                    $(el).attr('href', '/proxy' + href);
                } else if (href && href.startsWith('http')) {
                    $(el).attr('href', '/proxy?url=' + href);
                }
            });

            // Rewrite all other resources (like images, scripts, etc.)
            $('img, script, link').each((_, el) => {
                const src = $(el).attr('src');
                const href = $(el).attr('href');

                if (src && src.startsWith('/')) {
                    $(el).attr('src', '/proxy' + src);
                }
                if (href && href.startsWith('/')) {
                    $(el).attr('href', '/proxy' + href);
                }
            });

            res.send($.html());
        } else {
            // For non-HTML resources, just send them directly
            res.set(response.headers);
            res.send(response.data);
        }
    } catch (err) {
        res.status(500).send('Error fetching content');
    }
});

// Start the server
app.listen(3000, () => {
    console.log('Server running on http://localhost:3000');
});
