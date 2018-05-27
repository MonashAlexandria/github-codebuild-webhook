'use strict'

const BaseRule = require('./BaseRule.js')

class CheckForReleaseOrMasterBranches extends BaseRule {

  constructor(dataSet) {
    super(dataSet)
  }

  check() {
    return {
      isMatch:() => {
        const {branch} = this.dataSet
        return ['master','release'].includes(branch)
      },
      getTests:() => {
        this.getTest('js-php','unit-tests',false)
      }
    }
  }
}

module.exports = CheckForReleaseOrMasterBranches