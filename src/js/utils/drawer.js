import Snap from 'snapsvg'

export function drawSegmentPath(pathStr) {
  const svg = Snap('#mySvg')
  const pathSvg = svg.path(pathStr)
  pathSvg.hover(
    () => {
      pathSvg.attr({
        stroke: 'blue',
        'stroke-width': 4,
      })
    },
    () => {
      pathSvg.attr({
        stroke: 'black',
        'stroke-width': 1,
      })
    }
  )
  pathSvg.attr({
    fill: 'none',
    stroke: 'black',
    'stroke-width': 1,
  })
}

export function drawStorylinePath(storylinePath) {
  storylinePath.forEach(segmentPath => drawSegmentPath(segmentPath))
}

export function drawStoryline(storyline) {
  storyline.forEach(segment => {
    const segmentPath = generateSimplePath(segment)
    drawSegmentPath(segmentPath)
  })
}

function generateSimplePath(points) {
  if (points.length === 0) return ''
  let pathStr = `M ${points[0][0]} ${points[0][1]}`
  for (let i = 1, len = points.length; i < len; i++) {
    pathStr += `L ${points[i][0]} ${points[i][1]}`
  }
  return pathStr
}
