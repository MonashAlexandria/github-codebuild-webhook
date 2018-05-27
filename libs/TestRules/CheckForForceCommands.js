'use strict'

const BaseRule = require('./BaseRule.js')

const CheckForceCommandForceType = require('./CheckForceCommandForceType')
const CheckForceCommandForceArgument = require('./CheckForceCommandForceArgument')
const CheckForceCommandUat = require('./CheckForceCommandUat')
const CheckForceCommandFunctional = require('./CheckForceCommandFunctional')

class CheckForForceCommands extends BaseRule {
  constructor(dataSet) {
    super(dataSet)
  }

  check() {
    return {
      isMatch:() => {
        return this.dataSet.forceCommand && this.dataSet.isEnabledForceUATCommands
      },
      getTests:() => {
        this.getCombinedTests()
      }
    }
  }

  getCombinedTests() {
    const rules = [
      new CheckForceCommandForceType(this.dataSet),
      new CheckForceCommandForceArgument(this.dataSet),
      new CheckForceCommandUat(this.dataSet),
      new CheckForceCommandFunctional(this.dataSet)
    ]

    this.combineMatchingRules(rules)
  }
}

module.exports = CheckForForceCommands