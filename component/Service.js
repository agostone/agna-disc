'use strict';

var _ = require('lodash');
var _AbstractComponent = require('./AbstractComponent');

function Service(name, container, configuration) {

  if (!_.isPlainObject(configuration) && !configuration.type === 'service') {
    throw new Error('Invalid configuration, it should be a service configuration object!');
  }

  // @todo Reconsider once and event handling!
  if (_.has(configuration, 'once') && _.isPlainObject(configuration['once'])) {

    var functionName = void 0;
    _.forEach(_.keys(configuration['once']), function (value) {
      functionName = 'on' + value[0].toUpperCase() + value.substr(1);
      if (_.isFunction(this[functionName])) {
        container.on(value, this[functionName].bind(this));
      }
    }, this);
  }

  _AbstractComponent.call(this, name, container, configuration);
}

Service.prototype = Object.create(_AbstractComponent.prototype);

Service.prototype.instantiate = function () {

  if (_.isString(this.configuration.module)) {
    var module = this.container.loadModule(this.configuration.module);

    if (!_.isUndefined(this.configuration.constructorArguments)) {

      if (_.isString(this.configuration.constructorArguments)) {
        this.configuration.constructorArguments = [this.configuration.constructorArguments];
      }

      this.configuration.constructorArguments = this.container.resolveAllReferences(this.configuration.constructorArguments);

      var wrapper = function (parameters) {
        module.apply(this, parameters);
      };

      wrapper.prototype = Object.create(module.prototype);
      this.item = new wrapper(this.configuration.constructorArguments);
    } else { // No constructor parameter
      this.item = new module();
    }
  } else {
    this.item = this.configuration.module;
  }

  _AbstractComponent.prototype.instantiate.call(this);
};

Service.prototype.initialize = function () {

  if (_.isPlainObject(this.configuration.setters)) {

    var target = this.item;
    _.forOwn(this.configuration.setters, function (value, name) {

      if (_.isFunction(value) && value.callback === true) {
        value = value(this.container);
      }

      // Multi-call
      if (name[0] === '[') {
        name = _.trim(name, '[]');
        if (!_.isArray(value)) {
          throw new Error('Multi-call setter name must have an array value pair!');
        }
      } else {
        value = [value];
      }

      // Meaning a sub-object property/function should be set/called
      if (name.indexOf('.') !== -1) {
        name.split('.').forEach(function (value, index, nameArray) {
          if(index === nameArray.length - 1) {
            name = value;
          } else {
            target = target[value];
            if (_.isUndefined(target)) {
              throw new Error('No property exists with the name \'' + value + '\'!');
            }
          }
        });
      }

      value.forEach(function (value) {
        if (_.isFunction(target[name])) {
          target[name](this.container.resolveAllReferences(value));
        } else {
          target[name] = this.container.resolveAllReferences(value);
        }
      }, this);
    }, this);
  }
  _AbstractComponent.prototype.initialize.call(this);
};

Service.prototype.onDiscContainerInitialized = function () {

  var _States = require('./States');

  // @todo: ouch!
  while (this.state !== _States.INITIALIZED) {
    this._cycle();
  }

  var once = this.configuration['once']['discContainerInitialized'];

  if (!_.isArray(once)) {
    once = [once];
  }

  var method = void 0;
  var parameters = [];
  _.forEach(once, function (value) {

    if (_.isString(value)) {
      method = value;
    } else if (_.isPlainObject(value) && _.has(value, 'method') && _.has(value, 'arguments')) {

      method = value.method;
      parameters = this.container.resolveAllReferences(value.arguments);
      if (!_.isArray(parameters)) {
        parameters = [parameters];
      }
    }

    if (!_.isFunction(this.item[method])) {
      throw new Error('Invalid method parameters!');
    }

    this.item[method].apply(this.item, parameters);

  }, this);

  return this;
}

module.exports = Service;