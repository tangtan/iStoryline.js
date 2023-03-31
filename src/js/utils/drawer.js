import Snap from 'snapsvg'

export function drawSegmentPath(pathStr, defaultWidth = 2, hoverWidth = 4) {
  const svg = Snap('#mySvg')
  const pathSvg = svg.path(pathStr)
  pathSvg.hover(
    () => {
      pathSvg.attr({
        stroke: 'blue',
        'stroke-width': hoverWidth,
      })
    },
    () => {
      pathSvg.attr({
        stroke: 'black',
        'stroke-width': defaultWidth,
      })
    }
  )
  pathSvg.attr({
    fill: 'none',
    stroke: 'black',
    'stroke-width': defaultWidth,
  })
  return pathSvg
}

export function drawStorylinePath(storylinePath) {
  storylinePath.forEach(segmentPath => drawSegmentPath(segmentPath))
}

export function drawStoryline(character, storyline, type = 'simple') {
  storyline.forEach((segment, idx) => {
    let segmentPath = ''
    switch (type) {
      case 'bezier':
        segmentPath = generateBezierPath(segment)
        break
      default:
        segmentPath = generateSimplePath(segment)
        break
    }
    const segmentPathSvg = drawSegmentPath(segmentPath)
    segmentPathSvg.click(() => {
      console.log(character, idx)
    })
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

function generateBezierPath(points) {
  if (points.length < 4) return generateSimplePath(points)
  const pointsNum = points.length
  let i = 0
  let pathStr = `M ${points[i][0]} ${points[i][1]} C ${points[i + 1][0]} ${
    points[i + 1][1]
  } ${points[i + 2][0]} ${points[i + 2][1]} ${points[i + 3][0]} ${
    points[i + 3][1]
  }`
  for (i = 4; i < pointsNum - 2; i += 2) {
    pathStr += `S ${points[i][0]} ${points[i][1]} ${points[i + 1][0]} ${
      points[i + 1][1]
    }`
  }
  pathStr += ` L ${points[pointsNum - 1][0]} ${points[pointsNum - 1][1]}`
  return pathStr
}

export function drawSquaresAndBands(graphs, minY, maxY, padding) {
  const bezierRelaxer = 0.2
  const bandRelaxer = 0.1
  const svg = Snap('#mySvg')
  graphs.forEach((graph, idx) => {
    let minX = graph.minX
    let maxX = graph.maxX

    const squareWidth = maxX - minX
    const squareHeight = maxY - minY

    const totalConnectionLines =
      graph.lineUps + graph.lineDowns + graph.lineEquals
    if (totalConnectionLines > 0 && idx < graphs.length - 1) {
      // Down band
      if (graph.lineDowns > 0) {
        const bandWidth =
          (squareHeight * graph.lineDowns) / totalConnectionLines
        const sy0 = bandWidth / 2
        const sx0 = maxX
        const sy1 = sy0
        const sx1 = sx0 + bezierRelaxer * padding
        const ey0 = squareHeight - sy0
        const ex0 = maxX + padding
        const ey1 = ey0
        const ex1 = ex0 - bezierRelaxer * padding
        const bandSvg = svg.path(
          `M ${sx0} ${sy0} C ${sx1} ${sy1} ${ex1} ${ey1} ${ex0} ${ey0}`
        )
        bandSvg.attr({
          stroke: '#fd8829',
          opacity: 0.2,
          'stroke-width': bandWidth * bandRelaxer,
        })
      }
      if (graph.lineUps > 0) {
        const bandWidth = (squareHeight * graph.lineUps) / totalConnectionLines
        const ey0 = bandWidth / 2
        const ex0 = maxX + padding
        const ey1 = ey0
        const ex1 = ex0 - bezierRelaxer * padding
        const sy0 = squareHeight - ey0
        const sx0 = maxX
        const sy1 = sy0
        const sx1 = sx0 + bezierRelaxer * padding
        const bandSvg = svg.path(
          `M ${sx0} ${sy0} C ${sx1} ${sy1} ${ex1} ${ey1} ${ex0} ${ey0}`
        )
        bandSvg.attr({
          stroke: '#3e6285',
          opacity: 0.2,
          'stroke-width': bandWidth * bandRelaxer,
        })
      }
      if (graph.lineEquals > 0) {
        const bandWidth =
          (squareHeight * graph.lineEquals) / totalConnectionLines
        const sx0 = maxX
        const sy0 = minY + squareHeight / 2
        const ex0 = sx0 + padding
        const ey0 = sy0
        const bandSvg = svg.path(`M ${sx0} ${sy0} L ${ex0} ${ey0}`)
        bandSvg.attr({
          stroke: '#eee',
          opacity: 0.2,
          'stroke-width': bandWidth * bandRelaxer,
        })
      }
    }
    // draw rectangle
    svg.rect(minX, minY, squareWidth, squareHeight).attr({
      fill: 'white',
      stroke: 'blue',
      strokeWidth: 2,
      rx: 10,
      ry: 10,
    })
  })
}
