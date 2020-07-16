export function logConstraintError(type) {
  console.warn(`Invalid ${type} constraints.`)
}

export function logGeneratorError(type) {
  console.warn(`Invalid ${type} generator.`)
}

export function logStoryInfo(story) {
  console.log(story)
  // story size
  const rows = story.getTableRows()
  const cols = story.getTableCols()
  console.log(`Story Size: ${rows}x${cols}`)
  // story timeline
  const timeStamps = story.timeline
  console.log(`Story Timeline: ${timeStamps}`)
  // story characters
  const charaTable = story.getTable('character')
  console.log(
    `Character Table ${charaTable.rows}x${charaTable.cols}: ${charaTable.mat}`
  )
  // story locations
  const locationTable = story.getTable('location')
  console.log(
    `Location Table ${locationTable.rows}x${locationTable.cols}: ${locationTable.mat}`
  )
  // story sessions
  const sessionTable = story.getTable('session')
  console.log(
    `Session Table ${sessionTable.rows}x${sessionTable.cols}: ${sessionTable.mat}`
  )
}
