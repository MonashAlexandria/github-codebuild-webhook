'use strict';

const Rule = require('./Rule.js');

class UnitTestRule extends Rule {
  isMatch() {
    return true;
  }

  getTests(tests) {
    this.addTest(tests, 'js-php', 'unit-tests', false);
    return tests;
  }
}

module.exports = UnitTestRule;