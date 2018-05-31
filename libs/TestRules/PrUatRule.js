'use strict';

const Rule = require('./Rule.js');

class PrUatRule extends Rule {
  isMatch() {
    const { isEnabledUatFunctional } = this.dataSet;
    return !this.isFromMasterOrRelease() && isEnabledUatFunctional;
  }

  getTests(tests) {
    this.addTest(tests, 'backend', 'uat', false);
    this.addTest(tests, 'frontend', 'uat', false);
    this.addTest(tests, 'functional', 'functional', false);
    this.addTest(tests, 'deployment', 'deployment', true);
    return tests;
  }
}

module.exports = PrUatRule;