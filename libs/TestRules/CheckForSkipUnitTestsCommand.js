'use strict';

const Rule = require('./Rule.js');

class CheckForSkipUnitTestsCommand extends Rule {
  isMatch() {
    const {commitMessage} = this.dataSet;
    return commitMessage !== undefined &&
        commitMessage.indexOf('[skip unit-tests]') === -1;
  }

  getTests() {
    super.getTest('js-php', 'unit-tests', false);
  }
}

module.exports = CheckForSkipUnitTestsCommand;