'use strict';

const Rule = require('./Rule.js');

const CheckForceCommandForceArgument = require(
    './CheckForceCommandForceArgument');

class CheckForOtherBranchesOfUATFunctionalTestsNotEnabledForceArgument extends Rule {
  constructor(dataSet, newMap) {
    super(dataSet, newMap);
    this.dataSet = dataSet;
    this.newMap = newMap;
    this.checkForceCommandForceArgument = new CheckForceCommandForceArgument(
        this.dataSet, this.newMap);
  }

  isMatch() {
    const {branch, isEnabledUatFunctional, forceCommand, isEnabledForceUATCommands} = this.dataSet;
    return !['master', 'release'].includes(branch) && !isEnabledUatFunctional &&
        forceCommand && isEnabledForceUATCommands &&
        this.checkForceCommandForceArgument.isMatch();
  }

  getTests() {
    this.checkForceCommandForceArgument.getTests();
  }
}

module.exports = CheckForOtherBranchesOfUATFunctionalTestsNotEnabledForceArgument;