import { copyFileSync, cpSync, mkdirSync } from 'node:fs'

mkdirSync('dist/src/config', { recursive: true })
cpSync('src/config', 'dist/src/config', {
  recursive: true,
  filter: (path) =>
    path === 'src/config' ||
    (path.endsWith('.json') && !path.includes('.private.')),
})
for (const file of ['tsconfig.paths.js', 'tsconfig.json', 'package.json']) {
  copyFileSync(file, `dist/${file}`)
}

mkdirSync('dist/src/resolvers', { recursive: true })
copyFileSync('src/resolvers/schema.graphql', 'dist/src/resolvers/schema.graphql')
