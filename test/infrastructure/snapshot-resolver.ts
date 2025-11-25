import path from 'node:path'

export default {
  resolveSnapshotPath: (testPath: string, snapshotExtension: string) => {
    const absTestPath = path.resolve(process.cwd(), testPath)
    const relativePath = path.relative(process.cwd(), absTestPath)
    return path.join(process.cwd(), 'test', '__snapshots__', relativePath) + snapshotExtension
  },

  resolveTestPath: (snapshotFilePath: string, snapshotExtension: string) => {
    const relativePath = path.relative(
      path.join(process.cwd(), 'test', '__snapshots__'),
      snapshotFilePath
    )
    return path.join(process.cwd(), relativePath.slice(0, -snapshotExtension.length))
  },

  testPathForConsistencyCheck: path.join(process.cwd(), 'src', 'module', 'app', 'app.controller.spec.ts')
}
