'use strict';

const Rule = require('./Rule.js');

class CheckForceCommandForceType extends Rule {
  isMatch() {
    const {forceType, skipDeployment} = this.dataSet;
    const checkForceTypes = ['deployment', 'functional', 'uat'];
    return forceType && !skipDeployment && checkForceTypes.includes(forceType);
  }

  getTests() {
    super.getTest('deployment', 'deployment', true);
  }
}

module.exports = CheckForceCommandForceType;