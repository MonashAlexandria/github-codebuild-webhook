'use strict';

const Rule = require('./Rule.js');

class UnitTestRule extends Rule {

  getTests(tests) {
    this.addTest(tests, 'js-php', 'unit-tests');
    return tests;
  }
}

module.exports = UnitTestRule;