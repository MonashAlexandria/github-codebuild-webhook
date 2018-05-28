'use strict';

/**
 * Base class for Rules
 */
class Rule {

  constructor(dataSet, testsMap) {
    this.dataSet = dataSet;
    this.testsMap = testsMap;
  }

  // sets the given test in the map
  getTest(name, type, deployable) {
    this.testsMap.set(
        name,
        {
          name: name,
          type: type,
          deployable: deployable,
        });
  }

  isMatch() {}

  getTests() {}

}

module.exports = Rule;