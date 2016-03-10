'use strict';

function SimpleSubConstructorService() {}

SimpleSubConstructorService.prototype.test = function () {
  return 'SimpleSubConstructorService';
}

module.exports = {
    level: {
      service: SimpleSubConstructorService
    }
};