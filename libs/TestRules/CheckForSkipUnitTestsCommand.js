'use strict';

const CheckForNonUatFunctionalMasterReleaseBranches = require('./CheckForNonUatFunctionalMasterReleaseBranches.js');

class CheckForSkipUnitTestsCommand extends CheckForNonUatFunctionalMasterReleaseBranches {
  isMatch() {
    const {commitMessage} = this.dataSet;
    return commitMessage !== undefined && commitMessage.indexOf('[skip unit-tests]') === -1 && super.isMatchForSkipUnitTests();
  }

  getTests() {
    this.addTest('js-php', 'unit-tests', false);
    return Array.from(this.testsMap);
  }
}

module.exports = CheckForSkipUnitTestsCommand;