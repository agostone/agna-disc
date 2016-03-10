'use strict';

var _ = require('lodash');
var _AbstractComponent = require('./AbstractComponent');

function Value(name, container, configuration) {

  // Everything is a value, don't question that! =D
  if (configuration.type !== 'value') {
    configuration = {
      value: configuration
    };
  }

  _AbstractComponent.call(this, name, container, configuration);
}

Value.prototype = Object.create(_AbstractComponent.prototype);

Value.prototype.instantiate = function () {

  var value = this.configuration.value;
  var callback = this.configuration.callback;

  if (_.isUndefined(value) && _.isUndefined(callback)) {
    throw new Error('Either a \'value\' or a \'callback\' should bet set!');
  }

  if (!_.isUndefined(callback)) {
    value = callback(this.container);
  }

  this.item = value;

  _AbstractComponent.prototype.initialize.call(this);
};

module.exports = Value;
