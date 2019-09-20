'use strict';

const networkDevices = require('local-devices');
const express = require('express');
const port = 3000;

let devices = [];
let networkScannerPid;

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

app.get('/scan/start', async (req, res) => {
    startScan();
    res.sendStatus(200);
});

app.get('/scan/end', async (req, res) => {
    endScan();
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

const networkScanner = async () => {
    const list = await networkDevices();
    devices = list.map(device => {
        device.id = device.mac.replace(/:/g, '_');
        return device;
    });
    console.debug(`discovered ${devices.length} devices`);
};

const startScan = () => {
    if (!networkScannerPid) {
        networkScannerPid = setInterval(networkScanner, 3000);
    }
};

const endScan = () => {
    if (networkScannerPid) {
        clearInterval(networkScannerPid);
        networkScannerPid = undefined;
    }
};
