'use strict';

const ForceCommandRule = require('./ForceCommandRule.js');

class ForceCommandUatRule extends ForceCommandRule {
  isMatch() {
    const { forceArgument, forceType } = this.dataSet;
    return typeof forceArgument === 'undefined' && forceType === 'uat' && super.isMatch();
  }

  getTests(tests) {
    this.addTest(tests, 'backend', 'uat');
    this.addTest(tests, 'frontend', 'uat');
    this.addTest(tests, 'functional', 'functional');
    this.addTest(tests, 'deployment', 'deployment', true);
    return tests;
  }
}

module.exports = ForceCommandUatRule;