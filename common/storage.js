let map = {};

let storage = function(key, def) {
    return map[key] = map[key] || def || {};
};
storage.map = map;
module.exports = storage;