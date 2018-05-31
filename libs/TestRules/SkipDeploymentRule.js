'use strict';

const Rule = require('./Rule.js');

class SkipUnitTestsRule extends Rule {
  isMatch() {
    return this.dataSet.skipDeployment;
  }

  getTests(tests) {
    tests.delete('deployment');
    return tests;
  }
}

module.exports = SkipUnitTestsRule;