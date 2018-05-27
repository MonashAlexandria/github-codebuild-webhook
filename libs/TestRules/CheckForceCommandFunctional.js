'use strict'

const BaseRule = require('./BaseRule.js')

class CheckForceCommandFunctional extends BaseRule {
  constructor(dataSet) {
    super(dataSet)
  }

  check() {
    return {
      isMatch:() => {
        const {forceArgument,forceType} = this.dataSet
        return typeof forceArgument === 'undefined' && forceType === 'functional'
      },
      getTests:() => {
        this.getTest('functional','functional',false)
      }
    }
  }
}

module.exports = CheckForceCommandFunctional