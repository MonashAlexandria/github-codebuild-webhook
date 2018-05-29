'use strict';

const Rule = require('./Rule.js');

class CheckForReleaseOrMasterBranches extends Rule {
  isMatch() {
    const {branch} = this.dataSet;
    return ['master', 'release'].includes(branch);
  }

  getTests() {
    this.addTest('js-php', 'unit-tests', false);
    return Array.from(this.testsMap);
  }
}

module.exports = CheckForReleaseOrMasterBranches;