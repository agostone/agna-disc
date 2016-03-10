'use strict';

module.exports = {
  SimpleValue: {
    type: 'value',
    value: 'SimpleValue'
  },
  FunctionValue: {
    type: 'value',
    callback: function (container) { return container.get('SimpleValue'); }
  }
}
