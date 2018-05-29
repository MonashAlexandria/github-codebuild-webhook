'use strict';

const CheckForNonUatFunctionalMasterReleaseBranches = require('./CheckForNonUatFunctionalMasterReleaseBranches.js');

class CheckForceCommandForceType extends CheckForNonUatFunctionalMasterReleaseBranches {
  isMatch() {
    const { forceType, skipDeployment } = this.dataSet;
    const checkForceTypes = ['deployment', 'functional', 'uat'];
    return forceType && !skipDeployment && checkForceTypes.includes(forceType) && super.isMatch();
  }

  getTests() {
    this.addTest('deployment', 'deployment', true);
    return Array.from(this.testsMap);
  }
}

module.exports = CheckForceCommandForceType;