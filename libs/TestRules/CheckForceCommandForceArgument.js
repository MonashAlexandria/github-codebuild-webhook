'use strict';

const CheckForNonUatFunctionalMasterReleaseBranches = require('./CheckForNonUatFunctionalMasterReleaseBranches.js');

class CheckForceCommandForceArgument extends CheckForNonUatFunctionalMasterReleaseBranches {
  isMatch() {
    const { forceArgument } = this.dataSet;
    return forceArgument !== undefined && super.isMatch();
  }

  getTests() {
    this.addTest(this.dataSet.forceArgument.trim(), this.dataSet.forceType, false);
    return Array.from(this.testsMap);
  }
}

module.exports = CheckForceCommandForceArgument;