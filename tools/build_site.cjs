const fs=require('fs');
const babel=require('@babel/standalone');
const data=JSON.parse(fs.readFileSync('profile/research.json','utf8'));
let source=fs.readFileSync('profile/app.jsx','utf8');
source=source.replace(/const RESEARCH_DATA = .*?;\n/,`const RESEARCH_DATA = ${JSON.stringify(data)};\n`);
fs.writeFileSync('profile/app.jsx',source);
fs.writeFileSync('profile/app.js',babel.transform(source,{presets:['react'],comments:false,compact:true}).code);
console.log('Compiled portfolio application.');
