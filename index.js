var express = require('express');
var app = express();
var bodyParser = require('body-parser');
var cors = require('cors');

app.use(bodyParser.json());
app.use(cors());
app.set('json spaces', 4);

var baseUrl = "http://localhost:3000";

app.get('/', function (req, res) {
    res.send('An api to download video, music from youtube');
});

app.get('/download-audio', async function (req, res) {
    await download(req, res, "audio");
});

app.get('/download-video', async function (req, res) {
    await download(req, res, "video");
});

app.listen(3000, function () {
    console.log('Example app listening on port 3000!');
});

const convertHMS = (value) => new Date(value * 1000).toISOString().slice(11, 19);

async function download(req, res, type) {
    const ytdl = require('./ytdl-core/lib');
    const url = req.query.link;
    if(!url) return res.json({ error: "link is required" });
    const info = await ytdl.getInfo(url);
    const result = formatInfo(info);
    result.download = `${baseUrl}/download-${type}?link=${url}&stream=true`;
    if (req.query.stream) {
        const format = ytdl.chooseFormat(info.formats, { quality: type === "video" ? '18' : '249' });
        res.writeHead(200, {
            'Content-Type': type === "video" ? 'video/mp4' : 'audio/mpeg'
        });
        ytdl(url, { format }).pipe(res);
        console.log(result);
    } else {
        res.json(result);
    }
}

function formatInfo(info) {
    return {
        title: info.videoDetails.title,
        dur: convertHMS(Number(info.videoDetails.lengthSeconds)),
        viewCount: info.videoDetails.viewCount,
        likes: info.videoDetails.likes,
        author: info.videoDetails.author.name,
        download: null
    };
}