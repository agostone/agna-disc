'use strict';

module.exports = {
  SimpleService: {
    type: 'service',
    module: __dirname + '/module/SimpleService'
  },
  SimpleSubConstructorService: {
    type: 'service',
    module: '{!(' + __dirname + '/module/SimpleSubConstructorService.js).level.service}'
  },
  ConstructorInjection: {
    type: 'service',
    module: __dirname + '/module/ConstructorService',
    constructorArguments: 'ConstructorService'
  },
  SetterInjection: {
    type: 'service',
    module: __dirname + '/module/SetterService',
    setters: {
      setTest: 'SetterService',
      test2: 'SetterService2'
    }
  }
}
