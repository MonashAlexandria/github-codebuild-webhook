'use strict';

const ForceCommandRule = require('./ForceCommandRule.js');

class ForceCommandDeploymentRule extends ForceCommandRule {
  isMatch() {
    const { forceType } = this.dataSet;
    const checkForceTypes = ['deployment', 'functional', 'uat'];
    return forceType && checkForceTypes.includes(forceType) && super.isMatch();
  }

  getTests(tests) {
    this.addTest(tests, 'deployment', 'deployment', true);
    return tests;
  }
}

module.exports = ForceCommandDeploymentRule;