'use strict';

const Rule = require('./Rule.js');

class CheckForceCommandUat extends Rule {
  isMatch() {
    const {forceArgument, forceType} = this.dataSet;
    return typeof forceArgument === 'undefined' && forceType === 'uat';
  }

  getTests() {
    super.getTest('backend', 'uat', false);
    super.getTest('frontend', 'uat', false);
    super.getTest('functional', 'functional', false);
  }
}

module.exports = CheckForceCommandUat;