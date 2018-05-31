'use strict';

const PrUatRule = require('./PrUatRule');
const UnitTestRule = require('./UnitTestRule.js');
const SkipUnitTestsRule = require('./SkipUnitTestsRule.js');
const ForceCommandDeploymentRule = require('./ForceCommandDeploymentRule.js');
const ForceCommandArgumentRule = require('./ForceCommandArgumentRule.js');
const ForceCommandUatRule = require('./ForceCommandUatRule.js');
const ForceCommandFunctionalRule = require('./ForceCommandFunctionalRule.js');
const SkipDeploymentRule = require('./SkipDeploymentRule.js');

class RulesHelper {
  constructor(dataSet) {
    this.dataSet = dataSet;
  }

  getAllTests() {

    const rules = [
      new UnitTestRule(this.dataSet),
      new PrUatRule(this.dataSet),
      new ForceCommandDeploymentRule(this.dataSet),
      new ForceCommandArgumentRule(this.dataSet),
      new ForceCommandUatRule(this.dataSet),
      new ForceCommandFunctionalRule(this.dataSet),
      new SkipUnitTestsRule(this.dataSet),
      new SkipDeploymentRule(this.dataSet)
    ];

    return this.getAllRules(rules);
  }

  getAllRules(rules) {
    let tests = new Map();
    for (let rule of rules) {
      if (rule.isMatch()) {
        tests = rule.getTests(tests);
      }
    }
    return tests.size > 0 ? Array.from(tests.values()) : [];
  }
}

module.exports = RulesHelper;