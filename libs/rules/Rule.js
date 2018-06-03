'use strict';

/**
 * Base class for Rules
 */
class Rule {

  constructor(dataSet) {
    this.dataSet = dataSet;
  }

  isBranchFromMaster(){
    return 'master' === this.dataSet.branch;
  }

  // sets the given test in the map
  addTest(tests, name, type, deployable = false) {
    if (name !== '' && type !== '') {
      tests.set(
        name,
        {
          name: name,
          type: type,
          deployable: deployable,
        });
    }
  }

  isMatch() {
    return true;
  }

  getTests(tests) {
    return new Error('must override this function');
  }

}

module.exports = Rule;