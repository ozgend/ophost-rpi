'use strict';

const mdns = require('mdns-js');
const express = require('express');
const port = 3000;

const dnsData = [];
const dnsBrowser = mdns.createBrowser();

dnsBrowser.on('ready', function () {
    dnsBrowser.discover();
});

dnsBrowser.on('update', function (data) {
    console.log('data:', data);
    dnsData.push(data);
});

const intercept = function (req, res, next) {
    console.log(`-- ${req.path}`);
    next();
};

const app = express();

app.use(intercept);

app.get('/', (req, res) => res.send({ ok: true }));

app.get('/discover', (req, res) => {
    dnsBrowser.discover();
    res.send({ ok: true });
});

app.get('/dns/data', (req, res) => res.send(dnsData));

app.get('/dns/com', (req, res) => res.send(dnsBrowser.connections));

app.get('/device/:id', (req, res) => res.send({ ok: true, id: req.params.id }));

app.get('/device/:id/:action', (req, res) => res.send({ ok: true, id: req.params.id, status: req.params.action }));

app.get('/favicon.ico', (req, res) => res.status(204));

app.listen(port, () => console.log(`ophost started on ${port}!`));
