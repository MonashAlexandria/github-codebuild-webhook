'use strict';

const Rule = require('./Rule.js');

class CheckForOtherBranchesOfUATFunctionalTestsEnabled extends Rule {
  isMatch() {
    const {branch, isEnabledUatFunctional} = this.dataSet;
    return !['master', 'release'].includes(branch) && isEnabledUatFunctional;
  }

  getTests() {
    this.addTest('js-php', 'unit-tests', false);
    this.addTest('backend', 'uat', false);
    this.addTest('frontend', 'uat', false);
    this.addTest('functional', 'functional', false);
    this.addTest('deployment', 'deployment', true);
    return Array.from(this.testsMap);
  }
}

module.exports = CheckForOtherBranchesOfUATFunctionalTestsEnabled;