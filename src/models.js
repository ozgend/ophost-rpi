'use strict';

class Device {
    /**
     * @param  {string} ip
     * @param  {string} mac
     * @param  {string} id
     */
    constructor(ip, mac, id) {
        this.ip = ip;
        this.mac = mac;
        this.id = `op_${mac.replace(/:/g, '')}`;
        this.alias = '';
    }
};

class Action {
    /**
     * @param  {string} name
     * @param  {object} args
     */
    constructor(name, args) {
        this.name = name;
        this.args = args;
    }
}

class Builder {
    /**
     * @param  {Device} device
     * @param  {Action} action
     */
    static buildActionUrl(device, action) {
        const keys = Object.keys(action.args);
        const pairs = keys.map(key => {
            return `${key}=${action.args[key]}`;
        });
        const urlParameters = pairs.join('&');
        return `http://${device.ip}:80/${action.name}?${urlParameters}`;
    }
    /**
     * @param  {string} name
     * @param  {object} args
     */
    static buildAction(name, args) {
        let action;
        switch (name) {
            case 'switch':
                action = new Action(name, { to: args });
                break;
            default:
                action = new Action(name, args);
        }

        return action;
    }

    /**
     * @param  {string} ip
     * @param  {string} mac
     */
    static buildDevice(ip, mac) {
        return new Device(ip, mac);
    }
}

class DiscoveryOptions {
    constructor() {
        this.interface = undefined;
    }
}

module.exports = { DiscoveryOptions, Device, Action, Builder };
