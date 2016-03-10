'use strict';

var _ = require('lodash');
var _AbstractComponent = require('./AbstractComponent');

function Factory(name, container, configuration) {

  if (!_.isPlainObject(configuration) && !configuration.type === 'factory') {
    throw new Error('Invalid configuration, it should be a factory configuration object!');
  }

  _AbstractComponent.call(this, name, container, configuration);
}

Factory.prototype = Object.create(_AbstractComponent.prototype);

Factory.prototype.instantiate = function () {

  var factory = this.container.loadModule(this.configuration.module);

  if (!_.isFunction(factory)) {
    throw new Error('Invalid factory configuration, no factory function found!');
  }

  if (_.isUndefined(this.configuration.arguments)) {
    this.configuration.arguments = [];
  }

  if (_.isString(this.configuration.arguments)) {
    this.configuration.arguments = [this.configuration.arguments];
  }

  this.configuration.arguments = this.container.resolveAllReferences(this.configuration.arguments);

  this.item = function () {
    return factory.apply(factory, this.configuration.arguments);
  };

  _AbstractComponent.prototype.initialize.call(this)
};
