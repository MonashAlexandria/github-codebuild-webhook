'use strict';

/**
 * Base class for Rules
 */
class Rule {

  constructor(dataSet) {
    this.dataSet = dataSet;
  }

  isFromMasterOrRelease(){
    return ['master', 'release'].includes(this.dataSet.branch);
  }

  // sets the given test in the map
  addTest(tests, name, type, deployable) {
    if (name !== '' && type !== '' && deployable !== '') {
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