const mqtt = require('mqtt');
const { PubSubOptions } = require('./models');

class PubSubClient {
    /**
     * @param  {PubSubOptions} options
     */
    constructor(options) {
        this._options = options;
        this._client = mqtt.connect(options.host);
    }

    run() {
        this._options.events.forEach(event => {
            event.handler.bind(this);
            this._client.subscribe(event.topic, (err, granted) => {
                event.handler();
            });
        })
    }
};

const client = mqtt.connect('mqtt://test.mosquitto.org')