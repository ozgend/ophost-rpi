'use strict';

const port = 3000;
const express = require('express');
const DiscoveryService = require('./discovery-service');
const OpClient = require('./op-client');
const { Builder } = require('./models');

const _discoveryService = new DiscoveryService();
const _opClient = new OpClient();

let _devices = [];
let discoveryWorkerPid;

const intercept = function (req, res, next) {
    // console.log(`-- ${req.path}`);
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
    _devices = await _discoveryService.discover();
    res.send(_devices);
});

app.get('/discovery/start', async (req, res) => {
    startDiscoveryWorker();
    res.sendStatus(200);
});

app.get('/discovery/end', async (req, res) => {
    endDiscoveryWorker();
    res.send(_devices);
});

app.get('/devices', (req, res) => res.send(_devices));

app.get('/device-actions', async (req, res) => {
    _devices = await _discoveryService.discover();
    const actionUrls = _devices.map(d => {
        return {
            id: d.id,
            to1: Builder.buildActionUrl(d, Builder.buildAction('switch', 1)),
            to0: Builder.buildActionUrl(d, Builder.buildAction('switch', 0))
        };
    });

    const html = actionUrls.map(url => {
        return `<li>${url.id} -> <a href="${url.to0}" target="_blank">TO_0</a> | <a href=".${url.to1}" target="_blank">TO_1</a></li>`;
    }).join('\n');
    res.type('html').send(html);
});

app.get('/devices/:id', async (req, res) => {
    const device = await _discoveryService.find(req.params.id);
    if (device) {
        res.send(device);
    }
    else {
        res.sendStatus(404);
    }
});

app.get('/devices/:id/:action/:args', async (req, res) => {
    // forward action request to op-client....
    const device = await _discoveryService.find(req.params.id);
    if (!device) {
        res.sendStatus(404);
        return;
    }
    const action = Builder.buildAction(req.params.action, req.params.args);
    const result = await _opClient.forwardAction(device, action);
    res.send({ id: req.params.id, action: req.params.action, args: req.params.args, result });
});

app.get('/favicon.ico', (req, res) => res.status(204));

app.listen(port, () => console.log(`ophost started on ${port}!`));

const discoveryWorker = async () => {
    _devices = await _discoveryService.discover();
    console.debug(`discovered ${_devices.length} devices`);
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
