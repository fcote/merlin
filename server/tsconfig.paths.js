const { readFileSync } = require('fs')
const tsconfigPaths = require("tsconfig-paths");

const getTsConfigPaths = () => {
  const matchSlashStarComment = new RegExp(/(\/\*.*.\*\/)/, 'gi')
  const matchSlashComment = new RegExp(/(\/\/)/, 'gi')

  let tsconfig = readFileSync('./tsconfig.json')
  tsconfig = tsconfig.toString('utf8')
    .replace(matchSlashStarComment, '')
    .replace(matchSlashComment, '')
    .trim()
  const { compilerOptions: { paths } } = JSON.parse(tsconfig)

  return paths
}

tsconfigPaths.register({
  baseUrl: './',
  paths: getTsConfigPaths()
});

module.exports = { getTsConfigPaths }
