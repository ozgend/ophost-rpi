'use strict';

const fetch = require('node-fetch');
// eslint-disable-next-line no-unused-vars
const { Builder, Device, Action } = require('./models');

class OpClient {
    /**
     * @param  {Device} device
     * @param  {Action} action
     */
    async forwardAction(device, action) {
        try {
            const url = Builder.buildActionUrl(device, action);
            const response = await fetch(url);
            if (response && response.ok) {
                const result = await response.json();
                return result;
            }
            else {
                console.error(response);
            }
            return false;
        }
        catch (err) {
            console.error(err);
            return false;
        }
    }
}

module.exports = OpClient;
