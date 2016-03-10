'use strict';

function SetterService() {
}

SetterService.prototype.setTest = function (test) {
  this.test = test;
  return this;
};

module.exports = SetterService;