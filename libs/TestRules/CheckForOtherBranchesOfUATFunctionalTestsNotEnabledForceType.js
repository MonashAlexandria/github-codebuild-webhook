'use strict';

const Rule = require('./Rule.js');

const CheckForceCommandForceType = require('./CheckForceCommandForceType');

class CheckForOtherBranchesOfUATFunctionalTestsNotEnabledForceType extends Rule {
  constructor(dataSet, newMap) {
    super(dataSet, newMap);
    this.dataSet = dataSet;
    this.newMap = newMap;
    this.checkForceCommandForceType = new CheckForceCommandForceType(
        this.dataSet, this.newMap);
  }

  isMatch() {
    const {branch, isEnabledUatFunctional, forceCommand, isEnabledForceUATCommands} = this.dataSet;
    return !['master', 'release'].includes(branch) &&
        !isEnabledUatFunctional && forceCommand && isEnabledForceUATCommands &&
        this.checkForceCommandForceType.isMatch();
  }

  getTests() {
    this.checkForceCommandForceType.getTests();
  }
}

module.exports = CheckForOtherBranchesOfUATFunctionalTestsNotEnabledForceType;