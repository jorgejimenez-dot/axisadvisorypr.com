#!/usr/bin/env bash
# One-command build for the AXIS screener.
# Edit src.jsx, run ./build.sh, commit BOTH src.jsx and app.js.
set -euo pipefail
cd "$(dirname "$0")"
if [ ! -d node_modules/@babel/standalone ]; then
  npm install --no-save --silent @babel/standalone
fi
node -e "
const fs=require('fs');
const Babel=require('@babel/standalone');
const src=fs.readFileSync('src.jsx','utf8');
const out=Babel.transform(src,{presets:[['react',{runtime:'classic',pragma:'React.createElement',pragmaFrag:'React.Fragment'}]]}).code;
fs.writeFileSync('app.js','/* GENERATED FILE — DO NOT EDIT.\n   Source of truth: src.jsx — run ./build.sh after editing. */\n'+out);
console.log('Built app.js ('+out.length+' chars) from src.jsx');
"
