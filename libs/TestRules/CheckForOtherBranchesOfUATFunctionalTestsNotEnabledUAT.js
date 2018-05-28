'use strict';

const Rule = require('./Rule.js');

const CheckForceCommandUat = require(
    './CheckForceCommandUat');

class CheckForOtherBranchesOfUATFunctionalTestsNotEnabledUAT extends Rule {
  constructor(dataSet, newMap) {
    super(dataSet, newMap);
    this.dataSet = dataSet;
    this.newMap = newMap;
    this.checkForceCommandUat = new CheckForceCommandUat(this.dataSet,
        this.newMap);
  }

  isMatch() {
    const {branch, isEnabledUatFunctional, forceCommand, isEnabledForceUATCommands} = this.dataSet;
    return !['master', 'release'].includes(branch) &&
        !isEnabledUatFunctional && forceCommand && isEnabledForceUATCommands &&
        this.checkForceCommandUat.isMatch();
  }

  getTests() {
    this.checkForceCommandUat.getTests();
  }
}

module.exports = CheckForOtherBranchesOfUATFunctionalTestsNotEnabledUAT;