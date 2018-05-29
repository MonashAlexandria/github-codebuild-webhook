'use strict';

const Rule = require('./Rule.js');

class CheckForNonUatFunctionalMasterReleaseBranches extends Rule {

  isMatch() {
    const { branch, isEnabledUatFunctional, forceCommand, isEnabledForceUATCommands } = this.dataSet;
    return !['master', 'release'].includes(branch) && !isEnabledUatFunctional && forceCommand && isEnabledForceUATCommands;
  }

  isMatchForSkipUnitTests() {
    const {branch, isEnabledUatFunctional} = this.dataSet;
    return !['master', 'release'].includes(branch) && !isEnabledUatFunctional;
  }

}

module.exports = CheckForNonUatFunctionalMasterReleaseBranches;