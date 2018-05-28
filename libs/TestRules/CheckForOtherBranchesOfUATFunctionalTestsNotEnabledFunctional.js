'use strict';

const Rule = require('./Rule.js');

const CheckForceCommandFunctional = require(
    './CheckForceCommandFunctional');

class CheckForOtherBranchesOfUATFunctionalTestsNotEnabledFunctional extends Rule {
  constructor(dataSet, newMap) {
    super(dataSet, newMap);
    this.dataSet = dataSet;
    this.newMap = newMap;
    this.checkForceCommandFunctional = new CheckForceCommandFunctional(
        this.dataSet, this.newMap);
  }

  isMatch() {
    const {branch, isEnabledUatFunctional, forceCommand, isEnabledForceUATCommands} = this.dataSet;
    return !['master', 'release'].includes(branch) &&
        !isEnabledUatFunctional && forceCommand && isEnabledForceUATCommands &&
        this.checkForceCommandFunctional.isMatch();
  }

  getTests() {
    this.checkForceCommandFunctional.getTests();
  }
}

module.exports = CheckForOtherBranchesOfUATFunctionalTestsNotEnabledFunctional;