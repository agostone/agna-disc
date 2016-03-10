'use strict';

var _ = require('lodash');
var _States = require('./States');

function AbstractComponent(name, container, configuration) {

  configuration = _.isUndefined(configuration) ? {} : configuration;

  this.configuration = configuration;
  this.container = container;
  this.item = void 0;
  this.state = _States.CREATED;

  var self = this;

  Object.defineProperty(container, name, {
    configurable: true,
    get: function () {

      while (self.state !== _States.INITIALIZED) {
        self._cycle();
      }

      delete container[name];
      return container[name] = self.item;
    }
  });
}

AbstractComponent.prototype.instantiate = function () {
  this.state = _States.INSTANTIATED;
};

AbstractComponent.prototype.initialize = function () {
  this.state = _States.INITIALIZED;
};

AbstractComponent.prototype._cycle = function () {

  switch (this.state) {
    case _States.CREATED:
      this.instantiate();
      break;
    case _States.INSTANTIATED:
      this.initialize();
      break;
  }

  return this.state;
};

module.exports = AbstractComponent;