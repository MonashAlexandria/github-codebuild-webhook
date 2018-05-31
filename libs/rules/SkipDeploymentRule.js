'use strict';

const Rule = require('./Rule.js');

class SkipDeploymentRule extends Rule {
  isMatch() {
    return this.dataSet.skipDeployment;
  }

  getTests(tests) {
    tests.delete('deployment');
    return tests;
  }
}

module.exports = SkipDeploymentRule;