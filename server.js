const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');
const path = require('path');

const app = express();

// Serve the HTML page that contains the iframe
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Proxy requests to the target website
app.use('/proxy', createProxyMiddleware({
    target: 'http://en.oxtube.tv/',
    changeOrigin: true,
    pathRewrite: {
        '^/proxy': '', // remove /proxy from the URL
    },
}));

app.listen(3000, () => {
    console.log('Proxy server is running on http://localhost:3000');
});
