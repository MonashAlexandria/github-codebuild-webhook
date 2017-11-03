let { test } = require('ava');
let { push, unittests } = require('./helpers/helper.js');

test(push, ["master", "release"], [
  "My first commit message",
  "[skip unit-tests]",
  "[skip deployment]",
  "[on push]",
  "[on pr]",
  "[on pr][on push]",
  "[force uat]",
  "[force uat][on push]",
  "[force uat][on pr]",
  "[force uat][on pr][on push]",
  "[force uat test.php]",
  "[force uat test.php][on push]",
  "[force uat test.php][on pr]",
  "[force uat test.php][on pr][on push]",
  "[force functional]",
  "[force functional][on push]",
  "[force functional][on pr]",
  "[force functional][on pr][on push]",
  "[force functional test.php]",
  "[force functional test.php][on push]",
  "[force functional test.php][on pr]",
  "[force functional test.php][on pr][on push]",
  "[skip deployment][force uat]",
  "[skip deployment][force uat][on push]",
  "[skip deployment][force uat][on pr]",
  "[skip deployment][force uat][on pr][on push]",
  "[skip deployment][skip unit-tests][force uat][on push]",
  "[skip deployment][skip unit-tests][force uat][on pr]",
  "[skip deployment][skip unit-tests][force uat][on pr][on push]"
], [
  // ignore all commands on push to master or release
  // only execute unit tests
  unittests()
]);