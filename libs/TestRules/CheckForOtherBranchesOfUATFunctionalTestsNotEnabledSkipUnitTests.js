'use strict';

const Rule = require('./Rule.js');

const CheckForSkipUnitTestsCommand = require('./CheckForSkipUnitTestsCommand');

class CheckForOtherBranchesOfUATFunctionalTestsNotEnabledSkipUnitTests extends Rule {
  constructor(dataSet, newMap) {
    super(dataSet, newMap);
    this.dataSet = dataSet;
    this.newMap = newMap;
    this.checkForSkipUnitTestsCommand = new CheckForSkipUnitTestsCommand(
        this.dataSet, this.newMap);
  }

  isMatch() {
    const {branch, isEnabledUatFunctional} = this.dataSet;
    return !['master', 'release'].includes(branch) && !isEnabledUatFunctional &&
        this.checkForSkipUnitTestsCommand.isMatch();
  }

  getTests() {
    this.checkForSkipUnitTestsCommand.getTests();
  }
}

module.exports = CheckForOtherBranchesOfUATFunctionalTestsNotEnabledSkipUnitTests;