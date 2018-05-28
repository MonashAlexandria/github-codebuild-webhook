'use strict';

const CheckForReleaseOrMasterBranches = require(
    './CheckForReleaseOrMasterBranches');
const CheckForOtherBranchesOfUATFunctionalTestsEnabled = require(
    './CheckForOtherBranchesOfUATFunctionalTestsEnabled');
const CheckForOtherBranchesOfUATFunctionalTestsNotEnabledSkipUnitTests = require(
    './CheckForOtherBranchesOfUATFunctionalTestsNotEnabledSkipUnitTests');
const CheckForOtherBranchesOfUATFunctionalTestsNotEnabledForceArgument = require(
    './CheckForOtherBranchesOfUATFunctionalTestsNotEnabledForceArgument');
const CheckForOtherBranchesOfUATFunctionalTestsNotEnabledForceType = require(
    './CheckForOtherBranchesOfUATFunctionalTestsNotEnabledForceType');
const CheckForOtherBranchesOfUATFunctionalTestsNotEnabledFunctional = require(
    './CheckForOtherBranchesOfUATFunctionalTestsNotEnabledFunctional');
const CheckForOtherBranchesOfUATFunctionalTestsNotEnabledUAT = require(
    './CheckForOtherBranchesOfUATFunctionalTestsNotEnabledUAT');

class RulesHelper {
  constructor(dataSet) {
    this.dataSet = dataSet;
  }

  getAllTests() {

    // single map object to be used throughout the process
    let newMap = new Map();

    const rules = [
      new CheckForReleaseOrMasterBranches(this.dataSet, newMap),
      new CheckForOtherBranchesOfUATFunctionalTestsEnabled(this.dataSet,
          newMap),
      new CheckForOtherBranchesOfUATFunctionalTestsNotEnabledSkipUnitTests(
          this.dataSet, newMap),
      new CheckForOtherBranchesOfUATFunctionalTestsNotEnabledForceType(
          this.dataSet, newMap),
      new CheckForOtherBranchesOfUATFunctionalTestsNotEnabledForceArgument(
          this.dataSet, newMap),
      new CheckForOtherBranchesOfUATFunctionalTestsNotEnabledUAT(this.dataSet,
          newMap),
      new CheckForOtherBranchesOfUATFunctionalTestsNotEnabledFunctional(
          this.dataSet, newMap),

    ];

    return this.getAllRules(rules, newMap);
  }

  getAllRules(rules, newMap) {
    for (let rule of rules) {
      if (rule.isMatch()) {
        rule.getTests();
      }
    }
    return Array.from(newMap.values());
  }
}

module.exports = RulesHelper;