'use strict';

const CheckForNonUatFunctionalMasterReleaseBranches = require('./CheckForNonUatFunctionalMasterReleaseBranches.js');

class CheckForceCommandFunctional extends CheckForNonUatFunctionalMasterReleaseBranches {
  isMatch() {
    const { forceArgument, forceType } = this.dataSet;
    return typeof forceArgument === 'undefined' && forceType === 'functional' && super.isMatch();
  }

  getTests() {
    this.addTest('functional', 'functional', false);
    return Array.from(this.testsMap);
  }
}

module.exports = CheckForceCommandFunctional;