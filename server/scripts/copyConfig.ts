import * as shell from 'shelljs'

shell.exec(
  "find src/config -name '*.json' -exec cp -prv '{}' 'dist/src/config' ';'"
)
shell.exec("find ./ -name '*.env' -exec cp -prv '{}' 'dist' ';'")
shell.exec('cp -prv ./tsconfig.paths.js dist')
shell.exec('cp -prv ./package.json dist')
