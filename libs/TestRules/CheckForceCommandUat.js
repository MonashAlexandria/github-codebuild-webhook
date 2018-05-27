'use strict'

const BaseRule = require('./BaseRule.js')

class CheckForceCommandUat extends BaseRule {
  constructor(dataSet) {
    super(dataSet)
  }

  check() {
    return {
      isMatch:() => {
        const {forceArgument,forceType} = this.dataSet
        return typeof forceArgument === 'undefined' && forceType === 'uat'
      },
      getTests:() => {

        this.getTest('backend','uat',false)
        this.getTest('frontend','uat',false)
        this.getTest('functional','functional',false)
      }
    }
  }
}

module.exports = CheckForceCommandUat