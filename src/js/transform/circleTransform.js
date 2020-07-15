import { getBoundary, genNewPosition, genPath } from './freeTransform.js'

function transform(story, constraints) {
  const ctrs = constraints.filter(ctr => {
    return ctr.style === 'Reshape'
  })
  const position = story.getTable('position')
  const character = story.getTable('character')
  const positions = story.positions
  if (ctrs.length < 1) return position
  const { upperPath, lowerPath } = ctrs[ctrs.length - 1].param
  const { minX, maxX, minY, maxY } = getBoundary(story)
  let pos = [],
    tpos = []
  for (let i = 0, n = story.getTableRows(); i < n; i++) {
    pos[i] = []
    tpos[i] = []
    for (let j = 0, m = story.getTableCols(); j < m; j++) {
      pos[i][j] = []
      tpos[i][j] = null
      if (character.value(i, j)) {
        const storySegment = positions[position.value(i, j)]
        for (let k = 0, len = storySegment.length; k < len; k++) {
          const rY = (storySegment[k][1] - minY) / (maxY - minY)
          const rX =
            (storySegment[k][0] - storySegment[0][0]) /
            (storySegment[len - 1][0] - storySegment[0][0])
          const sNode = [
            upperPath[j << 1] + (lowerPath[j << 1] - upperPath[j << 1]) * rY,
            upperPath[(j << 1) | 1] +
              (lowerPath[(j << 1) | 1] - upperPath[(j << 1) | 1]) * rY,
          ]
          const eNode = [
            upperPath[(j + 1) << 1] +
              (lowerPath[(j + 1) << 1] - upperPath[(j + 1) << 1]) * rY,
            upperPath[((j + 1) << 1) | 1] +
              (lowerPath[((j + 1) << 1) | 1] - upperPath[((j + 1) << 1) | 1]) *
                rY,
          ]
          pos[i][j].push([
            sNode[0] + (eNode[0] - sNode[0]) * rX,
            sNode[1] + (eNode[1] - sNode[1]) * rX,
          ])
        }
      }
    }
  }
  const newPosition = genNewPosition(story, pos)
  return newPosition
}
function circleTransform(story, constraints) {
  const tPosition = transform(story, constraints)
  story.setTable('position', tPosition)
  const pathTable = genPath(story, constraints)
  story.setTable('path', pathTable)
  return position
}
export { circleTransform }
