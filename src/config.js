const fs = require('fs');
const path = require('path');

const ConfigPath = path.resolve(__dirname, '../config.json');

let Config = {};
try {
  Config = JSON.parse(fs.readFileSync(ConfigPath, 'utf8'));
} catch (error) {
  console.log(error);
  throw new Error(`Could not read config file at ${ConfigPath}`);
}

module.exports = Config;