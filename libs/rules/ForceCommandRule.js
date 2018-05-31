'use strict';

const Rule = require('./Rule.js');

class ForceCommandRule extends Rule {

  isMatch() {
    const { forceCommand, isEnabledForceUATCommands } = this.dataSet;
    return !this.isBranchFromMaster() && forceCommand && isEnabledForceUATCommands;
  }
}

module.exports = ForceCommandRule;