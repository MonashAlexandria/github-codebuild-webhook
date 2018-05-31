'use strict';

const Rule = require('./Rule.js');
/***
 * Run all tests when push to release (when freeze)
 * However, this still can be superseded by other rules
 * For example if commit message has [skip deployment], the deployment task will be removed.
 */
class PushToReleaseRule extends Rule {

  isMatch() {
    const { forceType } = this.dataSet;
    return this.dataSet.branch === "release" && !forceType;
  }

  getTests(tests) {
    this.addTest(tests, 'backend', 'uat');
    this.addTest(tests, 'frontend', 'uat');
    this.addTest(tests, 'functional', 'functional');
    this.addTest(tests, 'deployment', 'deployment', true);
    return tests;
  }
}

module.exports = PushToReleaseRule;