'use strict';

/**
 * Base class for Rules
 */
class Rule {

  constructor(dataSet) {
    this.dataSet = dataSet;
    this.testsMap = new Map();
  }

  // sets the given test in the map
  addTest(name, type, deployable) {
    if (name !== '' && type !== '' && deployable !== '') {
      this.testsMap.set(
        name,
        {
          name: name,
          type: type,
          deployable: deployable,
        });
    }
  }

  isMatch() {
  }

  getTests() {
  }

}

module.exports = Rule;