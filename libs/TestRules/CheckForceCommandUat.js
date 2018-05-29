'use strict';

const CheckForNonUatFunctionalMasterReleaseBranches = require('./CheckForNonUatFunctionalMasterReleaseBranches.js');

class CheckForceCommandUat extends CheckForNonUatFunctionalMasterReleaseBranches {
  isMatch() {
    const {forceArgument, forceType} = this.dataSet;
    return typeof forceArgument === 'undefined' && forceType === 'uat' && super.isMatch();
  }

  getTests() {
    this.addTest('backend', 'uat', false);
    this.addTest('frontend', 'uat', false);
    this.addTest('functional', 'functional', false);
    return Array.from(this.testsMap);
  }
}

module.exports = CheckForceCommandUat;