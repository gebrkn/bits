// Build the ChromeAPI docset for Dash.

var fs = require('fs');
var request = require('request');
var $ = require('cheerio');
var exec = require('child_process').exec;
var urlLib = require('url');
var path = require('path');
var sqlite3 = require('sqlite3');

var baseURL, docsetName;

switch (process.argv[2]) {
    case 'extensions':
        baseURL = 'https://developer.chrome.com/extensions/';
        docsetName = 'Chrome Extensions API';
        break;
    case 'apps':
        baseURL = 'https://developer.chrome.com/apps/';
        docsetName = 'Chrome Apps API';
        break;
    default:
        throw 'Usage: ' + process.argv[1] + ' extensions|apps';
}

var basePath = docsetName.replace(/ /g, '_');
var baseDir =  basePath + '.docset';
var docDir = baseDir + '/Contents/Resources/Documents/';
var localPages = {};
var index = {};
var images = {};

localPages[baseURL + 'api_index'] = 1;

function info(s) {
    console.log(s);
}

function getURL(url, fn) {
    var tmp = '/tmp/chromeapi_' + url.replace(/\W+/g, '_');
    if(fs.existsSync(tmp)) {
        fn(url, fs.readFileSync(tmp));
        return;
    }
    request({url:url, encoding:null}, function (error, response, body) {
        fs.writeFileSync(tmp, body);
        fn(url, fs.readFileSync(tmp));
    });
}

function getHTML(url, fn) {
    getURL(url, function(url, html) {
        var doc = $(html.toString());
        doc.find('a').each(function() {
            $(this).attr('href', urlLib.resolve(url, $(this).attr('href')));
        });
        fn(url, doc);
    });
}

function saveHTML(url, doc) {

    doc.find('nav').remove();
    doc.find('a').each(function() {
        var h = localLink($(this).attr('href'), url);
        $(this).attr('href', h);
    });
    doc.find('.video-container').replaceWith(function() {
        var src = 'http:' + $(this).find('iframe').attr("src");
        return $("<a href='" + src + "'>" + src + '</a>');
    });
    doc.find('img').each(function() {
        var h = urlLib.resolve(url, $(this).attr('src'));
        images[h] = 1;
        $(this).attr('src', 'assets/' + path.basename(h));
    });

    var h = [
        '<!DOCTYPE html>',
        '<html><head>',
        '<link href="assets/site.css" rel="stylesheet" type="text/css">',
        '<meta charset="utf-8" />',
        '</head><body><div>',
        '<main id="gc-pagecontent" role="main">',
        doc,
        '</main></div></body></html>'
    ].join('\n');

    fs.writeFileSync(docDir + '/' + localFile(url), h);
}

function localFile(url) {
    if(url.indexOf(baseURL) == 0)
        url = url.substr(baseURL.length);
    var s = url.split('#');
    if(s[0] == 'api_index')
        s[0] = 'index';
    return s[0].replace(/\W/g, '_') + '.html';
}

function localLink(url, context) {
    var s = url.split('#');
    if(s[0] == context && s[1])
        return '#' + s[1];
    if(localPages.hasOwnProperty(s[0])) {
        var f = localFile(s[0]);
        if(s[1]) f += '#' + s[1];
        return f;
    }
    return url;
}

function addPage(url) {
    var s = url.split('#');
    if(!localPages.hasOwnProperty(s[0]))
        localPages[s[0]] = 1;
}

function extractIndex(url, doc) {

    var htype = {
        'Types': 'Type',
        'Properties': 'Property',
        'Methods': 'Method',
        'Events': 'Event'
    };

    var mod = doc.find('h1').text();
    index[url] = [mod, 'Module', url];

    var header = null;
    doc.find('.api-summary tr').each(function() {
        if($(this).find('th').length) {
            var t = $(this).find('th').text();
            if(!htype[t])
                console.log('???', t);
            header = htype[t];
            return;
        }
        if(!header)
            return;
        $(this).find('a').each(function() {
            var h = $(this).attr('href');
            index[h] = [mod + '.' + $(this).text(), header, h];
        });
    });
}

function firstKey(obj) {
    var k = null;
    Object.keys(obj).some(function(x) {
        return obj[x] ? k = x : false;
    });
    return k;
}

function next() {
    queue.shift();
    if(queue.length) {
        go();
    }
}

function go() {
    queue[0]();
}

var queue = [

    function() {
        info('Creating build dir');
        exec('rm -rf ' + baseDir, function() {
            exec('rm -f ' + basePath + '.tgz', function() {
                exec('mkdir -p ' + docDir + '/assets', next);
            });
        });

    },

    function () {
        info('Getting css');
        getURL('https://developer.chrome.com/static/css/out/site.css', function(url, text) {
            var override = [
                '',
                '#gc-container { margin: 0 }',
                '.article-content [itemprop="articleBody"] { margin:0 }',
                'body { padding: 0 5em }',
                '* { font-family: "Lucida Grande",sans-serif }',
                '.code, code, pre { font-family: Monaco,monospace; color:black }'
            ].join('\n');
            fs.writeFileSync(docDir + '/assets/site.css', text + override);
            next();
        });
    },

    function () {
        var p = firstKey(localPages);
        if(!p) {
            next();
            return;
        }
        info('Fetching page ' + p);
        getHTML(p, function(url, doc) {
            var body = doc.find('main');
            var version = 0;

            if(url.match(/api_index$/)) {
                body.find('td:first-child a').each(function() {
                    var h = $(this).attr('href');
                    addPage(h);
                });
                body.find('td:nth-child(3)').each(function() {
                    var v = parseInt($(this).text());
                    if(v)
                        version = Math.max(version, v);
                });
                console.log('API version: ' + version);
            } else {
                extractIndex(url, body);
            }

            saveHTML(url, body);
            localPages[url] = 0;
            go();
        });
    },

    function () {
        var p = firstKey(images);
        if(!p) {
            next();
            return;
        }
        info('Fetching image ' + p);
        getURL(p, function(url, text) {
            fs.writeFileSync(docDir + '/assets/' + path.basename(url), text, {encoding:'binary'});
            images[url] = 0;
            go();
        });
    },

    function() {
        info('Writing index');

        var db = new sqlite3.Database(baseDir + '/Contents/Resources/docSet.dsidx');

        db.serialize(function() {
            db.run("CREATE TABLE searchIndex(id INTEGER PRIMARY KEY, name TEXT, type TEXT, path TEXT)");

            var stmt = db.prepare("INSERT INTO searchIndex(name, type, path) VALUES (?, ?, ?)");
            Object.keys(index).forEach(function(x) {
                var s = index[x];
                stmt.run(s[0], s[1], localLink(s[2]));
            });
            stmt.finalize();
        });

        db.close(next);
    },

    function() {
        info('Writing plist');

        var plist = [
            '<?xml version="1.0" encoding="UTF-8"?>',
            '<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">',
            '<plist version="1.0">',
            '<dict>',
            '	<key>CFBundleIdentifier</key>',
            '	<string>chrome</string>',
            '	<key>CFBundleName</key>',
            '	<string>' + docsetName + '</string>',
            '	<key>DashDocSetFamily</key>',
            '	<string>javascript</string>',
            '	<key>DocSetPlatformFamily</key>',
            '	<string>chrome</string>',
            '	<key>dashIndexFilePath</key>',
            '	<string>index.html</string>',
            '	<key>isDashDocset</key>',
            '	<true/>',
            '</dict>',
            '</plist>',
            ''
        ].join('\n');
        fs.writeFileSync(baseDir + '/Contents/Info.plist', plist);
        next();
    },

    function() {
        info('Compressing');
        exec('tar czf ' + basePath + '.tgz ' + baseDir, next);
    },


    function() {
        info('Done');
    }
];

go();

