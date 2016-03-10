'use strict';

var _Utility = require('./Utility');

module.exports = function (container, reference) {

  var module = reference;
  var name = module.match(new RegExp('^\\([^)]+\\)|[^' + _Utility.SEPARATOR + ']+','gi'));

  if (name !== null) {
    module = container.locator.__locate(name.shift().replace(/\(|\)/gi, ''));
    name.every(function (value) {
      module = module[value];
      return module !== void 0;
    });
  }

  return module;
};
