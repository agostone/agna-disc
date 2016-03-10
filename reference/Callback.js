'use strict';

var _Binding = require('./Binding');

module.exports = function (container, reference) {
  return _Binding(container, reference)(container);
};
