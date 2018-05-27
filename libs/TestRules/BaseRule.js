'use strict'

let testsMap = new Map()

/**
 * Base class for Rules
 */
class BaseRule {

  constructor(dataSet) {
    this.dataSet = dataSet
  }

  // sets the given test in the map
  getTest(name,type,deployable) {
    testsMap.set(
      name,
      {
        name:name,
        type:type,
        deployable:deployable
      })
  }

  combineMatchingRules(rules) {
    // loop through each matching rule and combine the tests
    for(let rule of rules){
      if(rule.check().isMatch()){
        rule.check().getTests()
      }
    }
  }

  getAllRules(rules) {
    this.combineMatchingRules(rules)
    const finalResultsMap = new Map(testsMap)
    testsMap.clear()
    return Array.from(finalResultsMap.values())
  }

}

module.exports = BaseRule