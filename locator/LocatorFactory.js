'use strict';

var _ = require('lodash');

module.exports = {
  separator: '.',
  factory: function (configuration) {

    var locator = void 0;

    // If configuration is a locator
    if (!_.isUndefined(configuration.__locate) && _.isFunction(configuration.__locate)) {
      locator = configuration;
    } else if (_.isFunction(configuration)) { // If configuration is a function itself
      locator =  {
        __locate: configuration
      };
    } else { // If configuration seems like a real configuration

      // If locator is a string, converting to module, method array
      if (_.isString(configuration)) {
        configuration = configuration.split(this.separator);
      }

      // If locator is an module, method array, converting to plain object
      if (_.isArray(configuration)) {

        configuration = {
          module: configuration[0],
          method: _.isUndefined(configuration[1]) ? void 0 : configuration[1]
        }
      }

      if (!_.isPlainObject(configuration) || _.isUndefined(configuration.module)) {
        throw new Error('Invalid locator configuration!');
      }

      locator = require(configuration.module);

      // Module and function locator
      if (!_.isUndefined(configuration.method)) {

        if (!_.isUndefined(locator.prototype)) {
          locator = new locator();
        }

        // Creating a function alias on the locator module, as the container calls __locate
        locator.__locate = locator[configuration.method];

      } else { // Simple function locator
        locator = {
          __locate: locator
        };
      }
    }

    return locator;
  }
};