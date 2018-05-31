'use strict';

const CheckForNonUatFunctionalMasterReleaseBranches = require('./ForceCommandRule.js');

class SkipUnitTestsRule extends CheckForNonUatFunctionalMasterReleaseBranches {
  isMatch() {
    const { commitMessage } = this.dataSet;
    return typeof commitMessage !== 'undefined' && commitMessage.indexOf('[skip unit-tests]') !== -1;
  }

  getTests(tests) {
    tests.delete('js-php');
    return tests;
  }
}

module.exports = SkipUnitTestsRule;