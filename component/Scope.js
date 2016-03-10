'use strict';

var _ = require('lodash');
var _AbstractComponent = require('./AbstractComponent');

function Scope(name, container, configuration) {

  if (_.isPlainObject(configuration) && configuration.type === 'scope') {

    if (_.isUndefined(configuration.configuration.allowOverwrite)) {
      configuration.configuration.allowOverwrite = container.allowOverwrite;
    }

    if (_.isUndefined(configuration.locator)) {
      configuration.configuration.locator = container.locator;
    }

    configuration.configuration.parent = container;

  } else {
    throw new Error('Invalid configuration, it should be a scope configuration object!');
  }

  _AbstractComponent.call(this, name, container, configuration);
}

Scope.prototype = Object.create(_AbstractComponent.prototype);

Scope.prototype.instantiate = function () {

  this.configuration.configuration.allowOverwrite = this.container.resolveReference(this.configuration.configuration.allowOverwrite);
  this.configuration.configuration.locator = this.container.resolveReference(this.configuration.configuration.locator);

  // @internal Requiring here to avoid redundancy.
  this.item = new (require('../Container'))(this.configuration.configuration);

  _AbstractComponent.prototype.initialize.call(this);
}

module.exports = Scope;
