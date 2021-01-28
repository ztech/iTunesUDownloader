var request = require('request');
var parseString = require('xml2js').parseString;
var Aria2 = require('aria2');


/* Aria2 Config */
var aria2Config = {
    host: '<ARIA2_HOST>',
    port: 6800,
    secure: false,
    secret: '<ARIA2_SECRET>',
    path: '/jsonrpc',
    jsonp: false
};
var aria2 = new Aria2(aria2Config);
/* Aria2 Config End */

var l = process.argv.length;
var url = process.argv[l-1];

var xmlHandler = function (xmlObj) {
    var title = xmlObj.feed.title[0]['_'];
    var entryArray = xmlObj.feed.entry;
    var files = [];
    for (var i = 0; i < entryArray.length; i++) {
        var file = {};
        var entry = entryArray[i];
        var link = entry.link[0]['$'];
        file.url = link.href;
        switch(link.type) {
            case 'application/pdf':
                file.name = entry.title[0]['_'] + '.pdf';
                break;
            case 'video/x-m4v':
                file.name = entry.title[0]['_'] + '.m4v';
                break;
            case 'video/mp4':
                file.name = entry.title[0]['_'] + '.mp4';
                break;
        }
        files.push(file);
    }
    return {title: title, files: files};
}

request(url, function (err, res, body) {
    if (err) {
        console.log("Network Error : "+err);
        process.exit(-1);
    }
    parseString(body, function (err, result) {
        if (err) {
            console.log("XML Parse Error : "+err);
            process.exit(-2);
        }
        var info = xmlHandler(result);
        for (var i = 0; i < info.files.length; i++) {
            var file = info.files[i];
            console.log("Addfile : "+file.name);
            aria2.addUri([file.url], {out: file.name}, function (err, res) {
                if (err) {
                    console.error("Aria2 ERROR : " + err);
                    process.exit(-3);
                }
            });
        }
    });
});
