import Snap from 'snapsvg'

export function drawInitial(pathStr) {
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
