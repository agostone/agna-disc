'use strict';

module.exports = {
  OPENING_BRACKET: '{',
  CLOSING_BRACKET: '}',
  SEPARATOR: '.',
  toArray: function (reference) {
    return reference.split(this.SEPARATOR);
  },
  toString: function (reference) {
    return reference.join(this.SEPARATOR);
  },
  list: function (reference) {

    var references = reference.match(
      new RegExp(this.OPENING_BRACKET + '[^' + this.CLOSING_BRACKET + ']*' + this.CLOSING_BRACKET, 'gi')
    );

    if (references !== null) {
      references.forEach(function (reference, index) {
        reference = reference.replace(new RegExp(this.OPENING_BRACKET + '|' + this.CLOSING_BRACKET, 'gi'), '');
        references[index] = {
          reference: references[index],
          id: reference[0],
          value: reference.slice(1)
        };
      }, this);
    }

    return references;
  }
};

