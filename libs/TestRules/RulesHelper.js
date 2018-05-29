'use strict';

const CheckForReleaseOrMasterBranches = require('./CheckForReleaseOrMasterBranches');
const CheckForOtherBranchesOfUATFunctionalTestsEnabled = require('./CheckForOtherBranchesOfUATFunctionalTestsEnabled');
const CheckForSkipUnitTestsCommand = require('./CheckForSkipUnitTestsCommand');
const CheckForceCommandForceType = require('./CheckForceCommandForceType');
const CheckForceCommandForceArgument = require('./CheckForceCommandForceArgument');
const CheckForceCommandUat = require('./CheckForceCommandUat');
const CheckForceCommandFunctional = require('./CheckForceCommandFunctional');

class RulesHelper {
  constructor(dataSet) {
    this.dataSet = dataSet;
  }

  getAllTests() {

    const rules = [
      new CheckForReleaseOrMasterBranches(this.dataSet),
      new CheckForOtherBranchesOfUATFunctionalTestsEnabled(this.dataSet),
      new CheckForSkipUnitTestsCommand(this.dataSet),
      new CheckForceCommandForceType(this.dataSet),
      new CheckForceCommandForceArgument(this.dataSet),
      new CheckForceCommandUat(this.dataSet),
      new CheckForceCommandFunctional(this.dataSet),
    ];

    return this.getAllRules(rules);
  }

  getAllRules(rules) {
    let newMap = new Map();
    for (let rule of rules) {
      if (rule.isMatch()) {
        let rulesReturned = rule.getTests();
        if (rulesReturned && rulesReturned.length > 0) {
          for (rule of rulesReturned) {
            newMap.set(rule[0], rule[1]);
          }
        }
      }
    }
    return Array.from(newMap.values()).length > 0 ? Array.from(newMap.values()) : [];
  }
}

module.exports = RulesHelper;