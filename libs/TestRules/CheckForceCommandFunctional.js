'use strict';

const Rule = require('./Rule.js');

class CheckForceCommandFunctional extends Rule {
  isMatch() {
    const {forceArgument, forceType} = this.dataSet;
    return typeof forceArgument === 'undefined' && forceType ===
        'functional';
  }

  getTests() {
    super.getTest('functional', 'functional', false);
  }
}

module.exports = CheckForceCommandFunctional;