const fs = require('fs');
const path = require('path');

const DatabaseFile = path.resolve(__dirname, '../data/db.json');
const FSOptions = {
  encoding: 'utf8',
};

class Database {
  constructor() {
    this._data = null;
    this._isLoaded = false;
  }

  _load() {
    if (!fs.existsSync(DatabaseFile)) {
      fs.writeFileSync(DatabaseFile, '{}', FSOptions);
    }

    const jsonString = fs.readFileSync(DatabaseFile, FSOptions);
  
    try {
      const json = JSON.parse(jsonString);
      this._data = json;
      this._isLoaded = true;
    } catch (error) {
      throw new Error('Invalid JSON in db.json');
    }
  }

  _write() {
    fs.writeFileSync(DatabaseFile, JSON.stringify(this._data), FSOptions);
  }

  get(key) {
    if (!Database._isLoaded) {
      this._load();
    }

    return this._data[key];
  }

  set(key, value) {
    if (!Database._isLoaded) {
      this._load();
    }

    this._data[key] = value;
    this._write();
  }
};

module.exports = new Database();