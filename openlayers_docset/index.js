// Build the OpenLayers docset for Dash.

/*
npm install
git clone https://github.com/openlayers/openlayers
cd openlayers
make apidoc
cd ..
node index.js
 */


const fs = require('fs');
const path = require('path');
const child_process = require('child_process');
const cheerio = require('cheerio')
const sqlite3 = require('sqlite3');
const sharp = require('sharp');

let docsetName = 'OpenLayers';

let outDir = __dirname + '/out';
let docsetDir = `${outDir}/${docsetName}.docset`;
let docsDir = `${docsetDir}/Contents/Resources/Documents`;

let srcDir = __dirname + '/openlayers/build/hosted/master/apidoc';

let resetCss = `
    <style>
        body { padding: 10px !important;}
        .main { margin: 0 !important;}
    </style>
`;

let toc = [];


function allFiles(dir) {
    let fpaths = [];

    fs.readdirSync(dir).forEach(function (fname) {
        if (fs.statSync(dir + '/' + fname).isDirectory())
            fpaths = fpaths.concat(allFiles(dir + '/' + fname));
        else
            fpaths.push(dir + '/' + fname);
    });

    return fpaths;
}

function processHTML(fname, text) {
    console.log('>', fname);

    let $ = cheerio.load(text);

    let title = $('.page-title').text();
    let m = title.match(/(Class|Namespace):\s*(\S+)/);

    if (!m)
        return null;

    toc.push([m[2], m[1], fname]);

    $('.navbar').remove();
    $('.navigation').remove();
    $('script').remove();

    return $.html() + resetCss;
}

function processFile(fpath) {
    let fname = fpath.split('/').pop();
    let text = fs.readFileSync(fpath, 'utf8');

    if (fname.endsWith('.css')) {
        fs.writeFileSync(docsDir + '/styles/' + fname, text);
    }

    if (fname.endsWith('.html')) {
        text = processHTML(fname, text);
        if (text)
            fs.writeFileSync(docsDir + '/' + fname, text);
    }
}


function writePlist() {
    let plist = `
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
    <key>CFBundleIdentifier</key>
    <string>ol</string>
    <key>CFBundleName</key>
    <string>${docsetName}</string>
    <key>DashDocSetFamily</key>
    <string>javascript</string>
    <key>DocSetPlatformFamily</key>
    <string>ol</string>
    <key>dashIndexFilePath</key>
    <string>index.html</string>
    <key>DashDocSetFallbackURL</key>
    <string>http://openlayers.org/en/latest/apidoc/</string>
    <key>isDashDocset</key>
    <true/>
</dict>
</plist>
    `;
    fs.writeFileSync(docsetDir + '/Contents/Info.plist', plist);
}

function writeDB() {
    return new Promise(function (resolve) {
        let db = new sqlite3.Database(docsetDir + '/Contents/Resources/docSet.dsidx');

        db.serialize(function () {
            db.run("CREATE TABLE searchIndex(id INTEGER PRIMARY KEY, name TEXT, type TEXT, path TEXT)");
            let stmt = db.prepare("INSERT INTO searchIndex(name, type, path) VALUES (?, ?, ?)");
            toc.forEach(x => stmt.run(...x));
            stmt.finalize();
        });

        db.close(resolve);
    });
}


function main() {
    Promise.resolve(null)
        .then($ => child_process.execSync(`rm -rf ${outDir} && mkdir -p "${docsDir}/styles"`))
        .then($ => allFiles(srcDir).forEach(processFile))
        .then($ => writePlist())
        .then($ => writeDB())
        .then($ => sharp(srcDir + '/logo-70x70.png').resize(16, 16).toFile(docsetDir + '/icon.png'))
        .then($ => sharp(srcDir + '/logo-70x70.png').resize(32, 32).toFile(docsetDir + '/icon@2x.png'))
        .then($ => child_process.execSync(`cd ${outDir} && tar czf ${docsetName}.tgz ${docsetName}.docset`))
        .then($ => console.log('DONE'));
}

main();

