'use strict';

const util = require('util');
const httpGetAsync = util.promisify(require('http').get);
// eslint-disable-next-line no-unused-vars
const { Builder, Device, Action } = require('./models');

class OpClient {
    /**
     * @param  {Device} device
     * @param  {Action} action
     */
    async forwardAction(device, action) {
        const url = Builder.buildActionUrl(device, action);
        const response = await httpGetAsync(url);
        console.log(response);
        return response;
    }
}

module.exports = OpClient;
