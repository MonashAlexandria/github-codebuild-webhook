'use strict'

const BaseRule = require('./BaseRule.js')

class CheckForceCommandForceArgument extends BaseRule {
  constructor(dataSet) {
    super(dataSet)
  }

  check() {
    return {
      isMatch:() => {
        const {forceArgument} = this.dataSet
        return forceArgument !== undefined
      },
      getTests:() => {
        this.getTest(this.dataSet.forceArgument.trim(),this.dataSet.forceType,false)
      }
    }
  }
}

module.exports = CheckForceCommandForceArgument