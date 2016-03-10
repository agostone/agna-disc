'use strict';

var _Utility = require('./Utility');

module.exports = function (container, reference) {

  var value = _Utility.toArray(reference);

  if (value.length < 2) {
    throw new Error('Binding reference should refer to an item and a function using a separator!');
  }

  var property = value.pop();
  value = container.get(_Utility.toString(value));
  return value[property].bind(value);
};
