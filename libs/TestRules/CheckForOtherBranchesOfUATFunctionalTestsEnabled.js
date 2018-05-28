'use strict';

const Rule = require('./Rule.js');

class CheckForOtherBranchesOfUATFunctionalTestsEnabled extends Rule {
  isMatch() {
    const {branch, isEnabledUatFunctional} = this.dataSet;
    return !['master', 'release'].includes(branch) && isEnabledUatFunctional;
  }

  getTests() {
    super.getTest('js-php', 'unit-tests', false);
    super.getTest('backend', 'uat', false);
    super.getTest('frontend', 'uat', false);
    super.getTest('functional', 'functional', false);
    super.getTest('deployment', 'deployment', true);
  }
}

module.exports = CheckForOtherBranchesOfUATFunctionalTestsEnabled;