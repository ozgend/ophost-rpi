'use strict';

const util = require('util');
const exec = util.promisify(require('child_process').exec);

const RX_IP = /(\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3})/gi;
const RX_MAC = /([0-9a-f]{1,2}:[0-9a-f]{1,2}:[0-9a-f]{1,2}:[0-9a-f]{1,2}:[0-9a-f]{1,2}:[0-9a-f]{1,2})/gi;

class DiscoveryService {
    constructor(options) {
        this._options = options || {};
        this._timer;
    }

    async discover() {
        let args = ['arp', '-a'];
        if (this._options.interface) {
            args.push(`-i ${this._options.interface}`);
        }
        const { stdout, stderr } = await exec(args.join(' '));

        if (stderr) {
            console.error(`error: ${stderr}`);
        }

        const rows = stdout.split('\n');
        const clients = [];

        rows.forEach(row => {
            const ipMatch = row.match(RX_IP);
            const macMatch = row.match(RX_MAC);

            if (!ipMatch || !macMatch) {
                return;
            }

            const ip = ipMatch[0];
            const mac = macMatch[0].split(':').map(d => {
                return d.length === 1 ? `0${d}` : d;
            }).join(':');

            const id = mac.replace(':', '');

            clients.push({ ip, mac, id });
        });

        return clients;
    }
};

module.exports = DiscoveryService;
