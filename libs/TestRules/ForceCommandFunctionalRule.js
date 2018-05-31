'use strict';

const ForceCommandRule = require('./ForceCommandRule.js');

class ForceCommandFunctionalRule extends ForceCommandRule {
  isMatch() {
    const { forceArgument, forceType } = this.dataSet;
    return typeof forceArgument === 'undefined' && forceType === 'functional' && super.isMatch();
  }

  getTests(tests) {
    this.addTest(tests, 'functional', 'functional', false);
    return tests;
  }
}

module.exports = ForceCommandFunctionalRule;