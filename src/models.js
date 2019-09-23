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
     * @param  {any[]} args
     */
    constructor(name, args) {
        this.name = name;
        this.args = args;
    }

    getArgs() {
        return this.args.join(',');
    }
}

class Builder {
    /**
     * @param  {Device} device
     * @param  {Action} action
     */
    static buildActionUrl(device, action) {
        return `http://${device.ip}:80/${action.name}?=${this.getArgs()}`;
    }
    /**
     * @param  {string} name
     * @param  {string} csvArgs
     */
    static buildAction(name, csvArgs) {
        return new Action(name, csvArgs.split(';'));
    }

    /**
     * @param  {string} ip
     * @param  {string} mac
     */
    static buildDevice(ip, mac) {
        return new Device(ip, mac);
    }
}

module.exports = { Device, Action, Builder };
