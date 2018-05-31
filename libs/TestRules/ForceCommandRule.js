'use strict';

const Rule = require('./Rule.js');

class ForceCommandRule extends Rule {

  isMatch() {
    const { isEnabledUatFunctional, forceCommand, isEnabledForceUATCommands } = this.dataSet;
    return !this.isFromMasterOrRelease() && !isEnabledUatFunctional && forceCommand && isEnabledForceUATCommands;
  }
}

module.exports = ForceCommandRule;