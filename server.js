'use strict';

const port = 3000;
const express = require('express');
const DiscoveryService = require('./discovery-service');
const _discoveryService = new DiscoveryService();

let devices = [];
let discoveryWorkerPid;

const intercept = function (req, res, next) {
    console.log(`-- ${req.path}`);
    next();
};

const app = express();

app.use(intercept);

app.get('/', (req, res) => {
    const apis = app._router.stack
        .filter(r => r.route)
        .map(r => r.route.path);

    const list = apis.map(api => {
        return `<li><a href=".${api}" target="_blank">${api}</a></li>`;
    }).join('\n');
    res.type('html').send(list);
});

app.get('/discover', async (req, res) => {
    devices = await _discoveryService.discover();
    res.send(devices);
});

app.get('/discovery/start', async (req, res) => {
    startDiscoveryWorker();
    res.sendStatus(200);
});

app.get('/discovery/end', async (req, res) => {
    endDiscoveryWorker();
    res.send(devices);
});

app.get('/devices', (req, res) => res.send(devices));

app.get('/devices/:id', (req, res) => {
    const device = devices.find(d => d.id === req.params.id);
    if (device) {
        res.send(device);
    }
    else {
        res.sendStatus(404);
    }
});

app.get('/devices/:id/:action/:args', (req, res) => {
    // forward action request to op-client....
    res.send({ ok: true, id: req.params.id, action: req.params.action, args: req.param.args });
});

app.get('/favicon.ico', (req, res) => res.status(204));

app.listen(port, () => console.log(`ophost started on ${port}!`));

const discoveryWorker = async () => {
    devices = await _discoveryService.discover();
    console.debug(`discovered ${devices.length} devices`);
};

const startDiscoveryWorker = () => {
    if (!discoveryWorkerPid) {
        discoveryWorkerPid = setInterval(discoveryWorker, 3000);
    }
};

const endDiscoveryWorker = () => {
    if (discoveryWorkerPid) {
        clearInterval(discoveryWorkerPid);
        discoveryWorkerPid = undefined;
    }
};
