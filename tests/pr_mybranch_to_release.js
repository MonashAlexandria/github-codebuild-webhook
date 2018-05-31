let { test } = require('ava');
let {
  pr,
  unittests,
  functional,
  deployment,
  uat
} = require('./helpers/helper.js');

test(pr, "mybranch", "release", [
  "normal commit",
  "[on push]",
  "[on pr]"
], [
  unittests(),
  uat("backend"),
  uat("frontend"),
  functional(),
  deployment(),
]);

test(pr, "mybranch", "release", [
  "[skip deployment]"
], [
  unittests(),
  uat("backend"),
  uat("frontend"),
  functional(),
  deployment(),
]);

test(pr, "mybranch", "release", [
  "[force uat][on push]"
], [
  unittests(),
  uat("backend"),
  uat("frontend"),
  functional(),
  deployment(),
]);

// test(pr, "mybranch", "release", [
//   "[force uat][on push]",
//   "[force uat test.php][on push]",
//   "[force functional][on push]",
//   "[force functional test.php][on push]",
//   "[skip unit-tests]",
//   "[skip unit-tests][on push]",
//   "[skip unit-tests][on push][on pr]",
//   "[force functional]",
//   "[force functional][on pr]",
//   "[force functional][on pr][on push]",
//   "[force functional f.php]",
//   "[force functional f.php][on pr]",
//   "[force functional f.php][on pr][on push]",
//   "[skip unit-tests][force functional]",
//   "[skip unit-tests][force functional][on pr]",
//   "[skip unit-tests][force functional][on pr][on push]",
//   "[skip unit-tests][force functional f.php]",
//   "[skip unit-tests][force functional f.php][on pr]",
//   "[skip unit-tests][force functional f.php][on pr][on push]",
//   "[skip deployment][force functional]",
//   "[skip deployment][force functional][on pr]",
//   "[skip deployment][force functional][on pr][on push]",
//   "[skip deployment][force functional f.php]",
//   "[skip deployment][force functional f.php][on pr]",
//   "[skip deployment][force functional f.php][on pr][on push]",
//   "[skip unit-tests][skip deployment][force functional]",
//   "[skip unit-tests][skip deployment][force functional][on pr]",
//   "[skip unit-tests][skip deployment][force functional][on pr][on push]",
//   "[skip unit-tests][skip deployment][force functional f.php]",
//   "[skip unit-tests][skip deployment][force functional f.php][on pr]",
//   "[skip unit-tests][skip deployment][force functional f.php][on pr][on push]",
//   "[force uat]",
//   "[force uat][on pr]",
//   "[force uat][on pr][on push]",
//   "[force uat uat.php]",
//   "[force uat uat.php][on pr]",
//   "[force uat uat.php][on pr][on push]",
//   "[skip unit-tests][force uat]",
//   "[skip unit-tests][force uat][on pr]",
//   "[skip unit-tests][force uat][on pr][on push]",
//   "[skip unit-tests][force uat uat.php]",
//   "[skip unit-tests][force uat uat.php][on pr]",
//   "[skip unit-tests][force uat uat.php][on pr][on push]",
//   "[skip deployment][force uat]",
//   "[skip deployment][force uat][on pr]",
//   "[skip deployment][force uat][on pr][on push]",
//   "[skip deployment][force uat uat.php]",
//   "[skip deployment][force uat uat.php][on pr]",
//   "[skip deployment][force uat uat.php][on pr][on push]",
//   "[skip unit-tests][skip deployment][force uat]",
//   "[skip unit-tests][skip deployment][force uat][on pr]",
//   "[skip unit-tests][skip deployment][force uat][on pr][on push]",
//   "[skip unit-tests][skip deployment][force uat uat.php]",
//   "[skip unit-tests][skip deployment][force uat uat.php][on pr]",
//   "[skip unit-tests][skip deployment][force uat uat.php][on pr][on push]",
//   "[force uat ignore.php][force uat uat.php]",
//   "[force uat ignore.php][force uat uat.php][on pr]",
//   "[force functional][force uat ignore.php][force uat uat.php][on pr][on push]"
// ], [
//   unittests(),
//   uat("backend"),
//   uat("frontend"),
//   deployment(),
//   functional()
// ]);