const fs=require('fs');
const babel=require('@babel/standalone');
const data=JSON.parse(fs.readFileSync('profile/research.json','utf8'));
let source=fs.readFileSync('profile/app.jsx','utf8');
source=source.replace(/const RESEARCH_DATA = .*?;\n/,`const RESEARCH_DATA = ${JSON.stringify(data)};\n`);
fs.writeFileSync('profile/app.jsx',source);
fs.writeFileSync('profile/app.js',babel.transform(source,{presets:['react'],comments:false,compact:true}).code);
console.log('Compiled portfolio application.');

const crypto=require('crypto');
const rev=crypto.createHash('sha256').update(fs.readFileSync('profile/app.js')).digest('hex').slice(0,12);
const html=fs.readFileSync('index.html','utf8').replace(/src="profile\/app\.js(?:\?v=[^"]*)?"/,`src="profile/app.js?v=${rev}"`);
fs.writeFileSync('index.html',html);
