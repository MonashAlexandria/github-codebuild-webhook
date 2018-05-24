'use strict';


/**
 * Fixed #3546: Rules Class containing all the logic related to
 */
class Rule {

  constructor(dataSet) {
    this.dataSet = dataSet;
    // map to store all the tests
    this.testsMap = new Map();
  }

  // sets the given test in the map
  getTest(name, type, deployable) {
    this.testsMap.set(
      name,
      {
        name: name,
        type: type,
        deployable: deployable
      });
  }

  checkForReleaseOrMasterBranches(dataSet) {
    return {
      isMatch: () => {
        const {branch} = dataSet;
        return ["master", "release"].includes(branch);
      },
      getTests: () => {
        this.getTest("js-php", "unit-tests", false);
      }
    }
  };

  checkForOtherBranchesOfUATFunctionalTestsEnabled(dataSet) {
    return {
      isMatch: () => {
        const {branch, isEnabledUatFunctional} = dataSet;
        return !["master", "release"].includes(branch) && isEnabledUatFunctional;
      },
      getTests: () => {
        this.getTest("js-php", "unit-tests", false);
        this.getTest("backend", "uat", false);
        this.getTest("frontend", "uat", false);
        this.getTest("functional", "functional", false);
        this.getTest("deployment", "deployment", true);
      }
    }
  };

  checkForOtherBranchesOfUATFunctionalTestsNotEnabled(dataSet) {
    return {
      isMatch: () => {
        const {branch, isEnabledUatFunctional} = dataSet;
        return !["master", "release"].includes(branch) && !isEnabledUatFunctional;
      },
      getTests: () => {
        // run unit-tests only if there is no skip command
        if (this.checkForSkipUnitTestsCommand(dataSet).isMatch()) {
          this.checkForSkipUnitTestsCommand().getTests();
        }
        // if there are force commands, add related tests
        if (this.checkForForceCommands(dataSet).isMatch()) {
          this.checkForForceCommands(dataSet).getTests();
        }
      }
    }
  };

  checkForSkipUnitTestsCommand(dataSet) {
    return {
      isMatch: () => {
        const {commitMessage} = dataSet;
        return commitMessage.indexOf("[skip unit-tests]") === -1;
      },
      getTests: () => {
        this.getTest("js-php", "unit-tests", false);
      }
    }
  };

  checkForceCommandForceType(dataSet) {
    return {
      isMatch: () => {
        const {forceType, skipDeployment} = dataSet;
        const checkForceTypes = ["deployment", "functional", "uat"];
        return forceType && !skipDeployment && checkForceTypes.includes(forceType);
      },
      getTests: () => {
        this.getTest("deployment", "deployment", true);
      }
    }
  };

  checkForceCommandForceArgument(dataSet) {
    return {
      isMatch: () => {
        const {forceArgument} = dataSet;
        return forceArgument && typeof forceArgument !== "undefined";
      },
      getTests: () => {
        this.getTest(this.dataSet.forceArgument.trim(), this.dataSet.forceType, false);
      }
    }
  };

  checkForceCommandUat(dataSet) {
    return {
      isMatch: () => {
        const {forceArgument, forceType} = dataSet;
        return typeof forceArgument === "undefined" && forceType === "uat";
      },
      getTests: () => {

        this.getTest("backend", "uat", false, this.testsMap);
        this.getTest("frontend", "uat", false, this.testsMap);
        this.getTest("functional", "functional", false);
      }
    }
  };

  checkForceCommandFunctional(dataSet) {
    return {
      isMatch: () => {
        const {forceArgument, forceType} = dataSet;
        return typeof forceArgument === "undefined" && forceType === "functional";
      },
      getTests: () => {
        this.getTest("functional", "functional", false);
      }
    }
  };

  // return all the force commands related to test
  checkForForceCommands(dataSet) {
    return {
      isMatch: () => {
        return dataSet.forceCommand && dataSet.isEnabledForceUATCommands;
      },
      getTests: () => {
        const rules = [
          this.checkForceCommandForceType(dataSet),
          this.checkForceCommandForceArgument(dataSet),
          this.checkForceCommandUat(dataSet),
          this.checkForceCommandFunctional(dataSet)
        ];

        this.getAllRules(rules);
      }
    }
  }

  // get all tests related to the given commands
  getTests() {
    let rules = [
      this.checkForReleaseOrMasterBranches(this.dataSet),
      this.checkForOtherBranchesOfUATFunctionalTestsEnabled(this.dataSet),
      this.checkForOtherBranchesOfUATFunctionalTestsNotEnabled(this.dataSet)
    ];

    return this.getAllRules(rules, true);
  }

  // combines the matching rules
  getAllRules(rules, ret = false) {
    // loop through each matching rule and combine the tests
    for (let rule of rules) {
      if (rule.isMatch()) {
        rule.getTests();
      }
    }
    // return map values in an array
    if (ret) {
      return Array.from(this.testsMap.values());
    }
  }
}

module.exports = Rule;