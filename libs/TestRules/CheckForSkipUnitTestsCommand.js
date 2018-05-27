'use strict'

const BaseRule = require('./BaseRule.js')

class CheckForSkipUnitTestsCommand extends BaseRule {

  constructor(dataSet) {
    super(dataSet)
  }

  check() {
    return {
      isMatch:() => {
        const {commitMessage} = this.dataSet
        return commitMessage !== undefined && commitMessage.indexOf('[skip unit-tests]') === -1
      },
      getTests:() => {
        this.getTest('js-php','unit-tests',false)
      }
    }
  }
}

module.exports = CheckForSkipUnitTestsCommand