'use strict';

const ForceCommandRule = require('./ForceCommandRule.js');

class ForceCommandArgumentRule extends ForceCommandRule {
  isMatch() {
    const { forceArgument } = this.dataSet;
    return forceArgument !== undefined && super.isMatch();
  }

  getTests(tests) {
    this.addTest(tests, this.dataSet.forceArgument.trim(), this.dataSet.forceType, false);
    return tests;
  }
}

module.exports = ForceCommandArgumentRule;