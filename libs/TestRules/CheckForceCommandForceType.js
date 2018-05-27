'use strict'

const BaseRule = require('./BaseRule.js')

class CheckForceCommandForceType extends BaseRule {
  constructor(dataSet) {
    super(dataSet)
  }

  check() {
    return {
      isMatch:() => {
        const {forceType,skipDeployment} = this.dataSet
        const checkForceTypes = ['deployment','functional','uat']
        return forceType && !skipDeployment && checkForceTypes.includes(forceType)
      },
      getTests:() => {
        this.getTest('deployment','deployment',true)
      }
    }
  }
}

module.exports = CheckForceCommandForceType