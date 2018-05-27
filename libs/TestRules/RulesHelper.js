'use strict'

const CheckForReleaseOrMasterBranches = require('./CheckForReleaseOrMasterBranches')
const BaseRule = require('./BaseRule')
const CheckForOtherBranchesOfUATFunctionalTestsEnabled = require('./CheckForOtherBranchesOfUATFunctionalTestsEnabled')
const CheckForOtherBranchesOfUATFunctionalTestsNotEnabled = require('./CheckForOtherBranchesOfUATFunctionalTestsNotEnabled')

class RulesHelper extends BaseRule {

  getAllTests() {

    const rules = [
      new CheckForReleaseOrMasterBranches(this.dataSet),
      new CheckForOtherBranchesOfUATFunctionalTestsEnabled(this.dataSet),
      new CheckForOtherBranchesOfUATFunctionalTestsNotEnabled(this.dataSet)
    ]

    return this.getAllRules(rules)
  }

}

module.exports = RulesHelper