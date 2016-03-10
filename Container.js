'use strict';

var _ = require('lodash');
var _ReferenceUtility = require('./reference/Utility');
var _EventEmitter = require('events').EventEmitter;

/**
 * Dependency injection container module
 *
 * @module agna-disc
 */
function Container(configuration) {

  if (!(this instanceof Container)) {
    return new Container(configuration);
  }

  if (!_.isPlainObject(configuration)) {
    throw new Error('Configuration must be an object!');
  }

  // Defaulting
  this.allowOverwrite = false;
  this.locator = { __locate: require };
  this.parent = void 0;

  var self = this;
  ['allowOverwrite', 'locator', 'parent'].forEach(function (property) {
    if (!_.isUndefined(configuration[property])) {
      self[property]= configuration[property];
      delete configuration[property];
    }
  });

  // Creating the locator
  this.locator = require('./locator/LocatorFactory').factory(this.locator);

  if (_.isUndefined(this.locator) || !_.isFunction(this.locator.__locate)) {
    throw new Error('Invalid \'locator\' option!');
  }

  if (!_.isBoolean(this.allowOverwrite)) {
    throw new Error('\'allowOverwrite\' option should be boolean!');
  }

  if (!_.isUndefined(this.parent) && !(this.parent instanceof Container)) {
    throw new Error('\'parent\' option should be an instance of Container!');
  }

  this._initialize(configuration);
}

Container.prototype = Object.create(_EventEmitter.prototype);
Container.INITIALIZED = 'discContainerInitialized';

Container.prototype._initialize = function (configuration) {

  // Registering
  _.forOwn(configuration, function (configuration, name) {
    this.set(name, configuration);
  }, this);

  // Eager loading
  _.forOwn(configuration, function (configuration, name) {
    if (configuration.eagerLoad === true) {
      this.get(name);
    }
  }, this);

  this.emit(Container.INITIALIZED, this);

  return this;
}

Container.componentTypes = require('./component/Types');
Container.referenceTypes = require('./reference/Types');

Container.prototype.set = function (name, configuration) {

  var type = _.isUndefined(configuration.type) ? 'value' : configuration.type;

  if (name[0] === '_') {
    throw new Error('Component names cannot start with an \'_\' character!');
  }

  if (_.isUndefined(Container.componentTypes[type])) {
    throw new Error('Invalid component type \'' + type + '\'!');
  }

  var container = _ReferenceUtility.toArray(name);
  name = container.shift();
  container = this._getSubScope(container);

  if (!_.isUndefined(container[name]) && !container.allowOverwrite) {
    throw new Error('A component already exist with the name \'' + name + '\'!');
  }

  new (Container.componentTypes[type])(name, container, configuration);

  return this;
};

Container.prototype._getSubScope = function (name) {

  var container = this;

  name.forEach(function (nameSegment) {
    if (!(container[nameSegment] instanceof Container)) {
      throw new Error('\'' + nameSegment + '\' scope doesn\'t exist!');
    }
    container = container[nameSegment];
  });

  return container;
};

Container.prototype.get = function (name) {

  name = _ReferenceUtility.toArray(name);
  var property = name.pop();
  var returnValue = this;
  var parentScope = this.parent;

  name.forEach(function (nameSegment, index) {

    returnValue = returnValue[nameSegment];

    // If what we are looking for is out of the scope tree and is rather a sub-property of and object tree,
    // there is no need to look in the parent scopes.
    if ((!_.isUndefined(returnValue) && !(returnValue instanceof Container)) ||
        (_.isUndefined(returnValue) && name.length > index)) {
      parentScope = void 0;
    }

    return !_.isUndefined(returnValue);
  });

  // Having a parent scope? Trying to get the property.
  if (!_.isUndefined(parentScope) && _.isUndefined(returnValue[property])) {
    returnValue = parentScope.get(property);
  }

  return returnValue[property];
}

Container.prototype.resolveReference = function (value) {

  if (_.isString(value)) {

    var references = _ReferenceUtility.list(value);
    if (references !== null) {

      var resolved = void 0;
      references.forEach(function (reference) {

        // If no reference type is registered with the resolved id, nothing to do, not considering it a real reference.
        if (_.isFunction(Container.referenceTypes[reference.id])) {

          // Resolving the reference
          resolved = Container.referenceTypes[reference.id](this, reference.value);

          if (_.isString(resolved)) {
            value = value.replace(reference.reference, resolved);
          } else if (references.length > 1) {
            throw new Error('If a string has multiple references, the references should refer to string values only!');
          } else if (_.isUndefined(resolved)) {
            throw new Error('Cannot resolve reference! (' + value + ')');
          } else {
            value = resolved;
          }
        }
      }, this);
    }
  }
  return value;
}

Container.prototype.resolveAllReferences = function (object) {

  if (_.isArray(object) || _.isPlainObject(object)) {

    _.forEach(object, function (value, index) {
      object[index] = this.resolveAllReferences(value);
    }, this);

  } else if (_.isString(object)) {
    object = this.resolveReference(object);
  }
  return object;
}

Container.prototype.loadModule = function (name) {

  var module = this.resolveReference(name);

  // Possibly not a reference
  if (_.isString(module)) {
    module = this.locator.__locate(module);
  }

  return module;
}

module.exports = Container;

