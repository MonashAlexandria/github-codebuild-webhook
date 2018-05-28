'use strict';

const Rule = require('./Rule.js');

class CheckForReleaseOrMasterBranches extends Rule {
  isMatch() {
    const {branch} = this.dataSet;
    return ['master', 'release'].includes(branch);
  }

  getTests() {
    super.getTest('js-php', 'unit-tests', false);
  }
}

module.exports = CheckForReleaseOrMasterBranches;