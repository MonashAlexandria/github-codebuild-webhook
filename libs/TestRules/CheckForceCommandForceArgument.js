'use strict';

const Rule = require('./Rule.js');

class CheckForceCommandForceArgument extends Rule {
  isMatch() {
    const {forceArgument} = this.dataSet;
    return forceArgument !== undefined;
  }

  getTests() {
    super.getTest(this.dataSet.forceArgument.trim(), this.dataSet.forceType,
        false);
  }
}

module.exports = CheckForceCommandForceArgument;