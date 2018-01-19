const { Readable } = require('stream');
const http = require('http');

class PlayerInstance extends Readable {
    constructor(parent, id) {
        super({});
        this.parent = parent;
        this.id = id;
    }
    _read(size) {
        this.parent.getData(this.id, size, (data, updatedOffset) => {
            this.push(data);
        });
    }
}

var playerCore = {
    buffer: Buffer.alloc(0),
    started: false,
    instances: {},
    getMinOffset: function () {
        var min;
        for (var id in this.instances) {
            if (min === undefined || this.instances[id].offset < min) {
                min = this.instances[id].offset;
            }
        }
        return min;
    },
    moveOffsets: function (offset) {
        for (var id in this.instances) {
            this.instances[id].offset -= offset;
        }
    },
    createInstance: function (channel, callback) {
        const id = channel.guild.id
        if (this.instances[id]) {
            callback(false);
        }
        channel.join().then(connection => {
            if (!this.started) {
                this.start();
            }
            var stream = new PlayerInstance(this, id);
            console.log("Creating instance for " + id);
            this.instances[id] = {
                stream,
                offset: this.buffer.length,
                connection
            }
            connection.playStream(stream, {
                passes: 2, //Possibly will stabilize the connection
                bitrate: "auto"
            });
            callback(true);
        })
    },
    removeInstance: function (id) {
        console.log("Removing instance " + id);
        var instance = this.instances[id];
        instance.connection.disconnect();
        delete this.instances[id];
        for (var key in this.instances) {
            return;
        }
        console.log("Last instance was removed");
        this.stop();
    },
    httpClient: null,
    start: function () {
        console.log('Starting player');
        this.started = true;
        this.httpClient = http.get('http://stream.gensokyoradio.net:8000/stream/1/listen.mp3', res => {
            res.on('data', chunk => {
                var minOffset = this.getMinOffset();
                if (this.buffer.length > minOffset) {
                    console.log("Some data (" + (this.buffer.length - minOffset) + " Bytes) left to read!!!");
                }
                if (minOffset === this.buffer.length) {
                    this.buffer = chunk;
                } else {
                    this.buffer = Buffer.concat([this.buffer.slice(minOffset), chunk]);
                }
                this.moveOffsets(minOffset);
                this.dataAvailable();
            });
        })
    },
    stop: function () {
        console.log("Stopping player");
        this.httpClient.abort();
        this.started = false;
    },
    getData: function (id, size, callback) {
        if (!this.instances[id]) {
            callback(null);
            return;
        }
        if (this.instances[id].offset >= this.buffer.length) {
            for (var i = 0; i < this.waiters.length; i++) {
                if (this.waiters[i].id === id) {
                    return;
                }
            }
            this.waiters.push({ id, size, callback });
            return;
        }
        var buf = this.buffer.slice(this.instances[id].offset, this.instances[id].offset + size);
        this.instances[id].offset += buf.length;
        callback(buf);
    },
    waiters: [],
    dataAvailable: function () {
        var waiters = this.waiters;
        this.waiters = [];

        var waiter;
        while (waiter = waiters.shift()) {
            this.getData(waiter.id, waiter.size, waiter.callback);
        }
    }
}

module.exports = {
    addInstance: function (channel, callback) {
        playerCore.createInstance(channel, callback);
    },
    stopInstance: function (guild) {
        playerCore.removeInstance(guild);
    },
    getInstanceList: function () {
        return playerCore.instances;
    }
}