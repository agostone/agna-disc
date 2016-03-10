'use strict';

require('jasmine-expect');

describe('agna-disc', function () {

  var _Container = require('../Container');

  it('should throw an error when configuration locator option is wrong', function () {
    expect(function () {
      new _Container(require('./library/InvalidConfig').locator);
    }).toThrowError('Invalid locator configuration!');
  });

  it('should throw an error when configuration is of wrong type', function () {
    expect(function () {
      new _Container(require('./library/InvalidConfig').general);
    }).toThrowError('Configuration must be an object!');
  });

  it('should initialize a simple value item', function () {
    var container = new _Container(require('./library/ValueConfig'));
    expect(container.get('SimpleValue')).toBe('SimpleValue');
  });

  it('should initialize a value item provided by a function call', function () {
    var container = new _Container(require('./library/ValueConfig'));
    expect(container.get('FunctionValue')).toBe('SimpleValue');
  });

  it('should initialize a simple sub-scope', function () {
    var container = new _Container(require('./library/ScopeConfig'));
    expect(container.get('SimpleScope') instanceof _Container).toBeTruthy();
  });

  it('should initialize a simple service', function () {
    var container = new _Container(require('./library/ServiceConfig'));
    expect(container.get('SimpleService').test()).toBe('SimpleService');
  });

  it('should initialize a simple service using a path and a sub-constructor method', function () {
    var container = new _Container(require('./library/ServiceConfig'));
    expect(container.get('SimpleSubConstructorService').test()).toBe('SimpleSubConstructorService');
  });

  it('should initialize a service using constructor injection', function () {
    var container = new _Container(require('./library/ServiceConfig'));
    expect(container.get('ConstructorInjection').test).toBe('ConstructorService');
  });

  it('should initialize a service using setter injection', function () {
    var container = new _Container(require('./library/ServiceConfig'));
    var setterInjection = container.get('SetterInjection');
    expect(setterInjection.test).toBe('SetterService');
    expect(setterInjection.test2).toBe('SetterService2');
  });
});
