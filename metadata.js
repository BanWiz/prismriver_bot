const EventEmitter = require('events');
const https = require('https');
const {parseString} = require('xml2js');

class Metadata extends EventEmitter {
    constructor() {
        super();
        this.metadata = {
            albumart: '',
            artist: '',
            album: '',
            circle: '',
            year: ''
        }
    }
    load() {
        https.get('https://gensokyoradio.net/xml/', (res) => {
            var buffer = '';
            res.setEncoding('utf8');
            res.on('data', chunk => buffer += chunk);
            res.on('end', () => {
                parseString(buffer, (err, result) => {
                    var time = parseInt(result.GENSOKYORADIODATA.SONGTIMES[0].REMAINING[0], 10) * 1000;
                    
                    var songInfo = result.GENSOKYORADIODATA.SONGINFO[0];
                    this.metadata.artist = songInfo.ARTIST[0];
                    this.metadata.title = songInfo.TITLE[0];
                    this.metadata.album = songInfo.ALBUM[0];
                    this.metadata.year = songInfo.YEAR[0];
                    this.metadata.circle = songInfo.CIRCLE[0];
                    this.metadata.albumart = result.GENSOKYORADIODATA.MISC[0].ALBUMART[0];

                    console.log("Playing " + this.metadata.artist + " - " + this.metadata.title);

                    console.log("Remaining time: " + time);
                    if(time <= 0) {
                        console.log("Changing to 1 sec");
                        time = 1000;
                    }

                    setTimeout(() => this.load(), time);

                    this.emit("update", this.metadata);
                });
            });
        });
    }
}

var metadata = {
    albumart: '',
    artist: '',
    album: '',
    circle: '',
    year: ''
}

module.exports = new Metadata();