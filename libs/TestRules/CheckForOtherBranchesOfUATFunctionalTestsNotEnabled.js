'use strict'

const BaseRule = require('./BaseRule.js')

const CheckForSkipUnitTestsCommand = require('./CheckForSkipUnitTestsCommand')
const CheckForForceCommands = require('./CheckForForceCommands')

class CheckForOtherBranchesOfUATFunctionalTestsNotEnabled extends BaseRule {
  constructor(dataSet) {
    super(dataSet)
  }

  check() {
    return {
      isMatch:() => {
        const {branch,isEnabledUatFunctional} = this.dataSet
        return !['master','release'].includes(branch) && !isEnabledUatFunctional
      },
      getTests:() => {
        this.getCombinedCommands()
      }
    }
  }

  getCombinedCommands() {
    let checkForSkipUnitTestsCommand = new CheckForSkipUnitTestsCommand(this.dataSet)
    let checkForForceCommands = new CheckForForceCommands(this.dataSet)

    if(checkForSkipUnitTestsCommand.check().isMatch()){
      checkForSkipUnitTestsCommand.check().getTests()
    }

    if(checkForForceCommands.check().isMatch()){
      checkForForceCommands.check().getTests()
    }
  }
}

module.exports = CheckForOtherBranchesOfUATFunctionalTestsNotEnabled