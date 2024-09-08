const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');

const app = express();

// Proxy requests to the target URL
app.use('/', createProxyMiddleware({
    target: 'https://www.rexporn.sex', // target website
    changeOrigin: true,
    onProxyReq: function (proxyReq, req, res) {
        // Modify headers, etc. if needed
    }
}));

app.listen(3000, () => {
    console.log('Proxy server is running on http://localhost:3000');
});
