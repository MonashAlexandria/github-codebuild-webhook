let { test } = require('ava');
let {
  push,
  unittests,
  functional,
  deployment,
  uat
} = require('./helpers/helper.js');

test(push, "mybranch", [
  "normal commit",
  "[on push]",
  "[on pr]",
  "[skip deployment]",
  "[force uat]",
  "[force uat][on pr]",
  "[force uat test.php]",
  "[force uat test.php][on pr]",
  "[force functional]",
  "[force functional][on pr]",
  "[force functional test.php]",
  "[force functional test.php][on pr]"
], [
  // without [on push] we only execute unit-tests
  unittests()
]);

test(push, "mybranch", [
  "[skip unit-tests]",
  "[skip unit-tests][on push]",
  "[skip unit-tests][on pr]",
  "[skip unit-tests][on pr][on push]"
], [
  // no tests
]);

test(push, "mybranch", [
  "[force functional][on push]",
  "[force functional][on push][on pr]"
], [
  unittests(),
  deployment(),
  functional()
]);

test(push, "mybranch", [
  "[force functional f.php][on push]",
  "[force functional f.php][on push][on pr]"
], [
  unittests(),
  deployment(),
  functional("f.php")
]);

test(push, "mybranch", [
  "[skip unit-tests][force functional][on push]",
  "[skip unit-tests][force functional][on push][on pr]"
], [
  deployment(),
  functional()
]);

test(push, "mybranch", [
  "[skip unit-tests][force functional f.php][on push]",
  "[skip unit-tests][force functional f.php][on push][on pr]"
], [
  deployment(),
  functional("f.php")
]);

test(push, "mybranch", [
  "[skip deployment][force functional][on push]",
  "[skip deployment][force functional][on push][on pr]"
], [
  unittests(),
  functional()
]);

test(push, "mybranch", [
  "[skip deployment][force functional f.php][on push]",
  "[skip deployment][force functional f.php][on push][on pr]"
], [
  unittests(),
  functional("f.php")
]);

test(push, "mybranch", [
  "[skip unit-tests][skip deployment][force functional][on push]",
  "[skip unit-tests][skip deployment][force functional][on push][on pr]"
], [
  functional()
]);

test(push, "mybranch", [
  "[skip unit-tests][skip deployment][force functional f.php][on push]",
  "[skip unit-tests][skip deployment][force functional f.php][on push][on pr]"
], [
  functional("f.php")
]);

test(push, "mybranch", [
  "[force uat][on push]",
  "[force uat][on push][on pr]",
  "Should work with multilines\n[force uat][on push]"
], [
  unittests(),
  deployment(),
  uat("backend"),
  uat("frontend"),
  functional()
]);

test(push, "mybranch", [
  "[force uat uat.php][on push]",
  "[force uat uat.php][on push][on pr]"
], [
  unittests(),
  deployment(),
  uat("uat.php")
]);

test(push, "mybranch", [
  "[skip unit-tests][force uat][on push]",
  "[skip unit-tests][force uat][on push][on pr]"
], [
  deployment(),
  uat("backend"),
  uat("frontend"),
  functional()
]);

test(push, "mybranch", [
  "[skip unit-tests][force uat uat.php][on push]",
  "[skip unit-tests][force uat uat.php][on push][on pr]"
], [
  deployment(),
  uat("uat.php")
]);

test(push, "mybranch", [
  "[skip deployment][force uat][on push]",
  "[skip deployment][force uat][on push][on pr]"
], [
  unittests(),
  uat("backend"),
  uat("frontend"),
  functional()
]);

test(push, "mybranch", [
  "[skip deployment][force uat uat.php][on push]",
  "[skip deployment][force uat uat.php][on push][on pr]"
], [
  unittests(),
  uat("uat.php")
]);

test(push, "mybranch", [
  "[skip unit-tests][skip deployment][force uat][on push]",
  "[skip unit-tests][skip deployment][force uat][on push][on pr]"
], [
  uat("backend"),
  uat("frontend"),
  functional()
]);

test(push, "mybranch", [
  "[skip unit-tests][skip deployment][force uat uat.php][on push]",
  "[skip unit-tests][skip deployment][force uat uat.php][on push][on pr]"
], [
  uat("uat.php")
]);

test(push, "mybranch", [
  "[force uat ignore.php][force uat uat.php][on push]",
  "[force functional][force uat ignore.php][force uat uat.php][on push]"
], [
  // consider only the last occurence of [force uat]
  unittests(),
  deployment(),
  uat("uat.php")
]);

test(push, "release", [
  "Dummy commit"
], [
  // consider only the last occurence of [force uat]
  uat("backend"),
  uat("frontend"),
  functional(),
  deployment(),
  unittests()
]);

test(push, "release", [
  "[force uat ignore.php][force uat uat.php][on push]"
], [
  // consider only the last occurence of [force uat]
  unittests(),
  deployment(),
  uat("uat.php")
]);

test(push, "release", [
  "[skip deployment][force uat][on push]",
  "[skip deployment][force uat][on push][on pr]"
], [
  unittests(),
  uat("backend"),
  uat("frontend"),
  functional()
]);