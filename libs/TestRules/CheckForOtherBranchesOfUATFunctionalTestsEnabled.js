'use strict'

const BaseRule = require('./BaseRule.js')

class CheckForOtherBranchesOfUATFunctionalTestsEnabled extends BaseRule {
  constructor(dataSet) {
    super(dataSet)
  }

  check() {
    return {
      isMatch:() => {
        const {branch,isEnabledUatFunctional} = this.dataSet
        return !['master','release'].includes(branch) && isEnabledUatFunctional
      },
      getTests:() => {
        this.getTest('js-php','unit-tests',false)
        this.getTest('backend','uat',false)
        this.getTest('frontend','uat',false)
        this.getTest('functional','functional',false)
        this.getTest('deployment','deployment',true)
      }
    }
  }
}

module.exports = CheckForOtherBranchesOfUATFunctionalTestsEnabled