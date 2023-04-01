// import { logStoryInfo } from '../../src/js/utils/logger'
import { drawStoryline, drawSquaresAndBands } from '../../src/js/utils/drawer'
import iStoryline from '../../src/js'

async function main(fileUrl, partition, svgPadding = 50) {
  const containerDom = document.getElementById('mySvg')
  const graphPadding = 100
  const minX = svgPadding
  const maxX = containerDom.clientWidth - svgPadding
  const minY = svgPadding
  const maxY = containerDom.clientHeight - svgPadding
  const graphMinX = minX + svgPadding
  const graphMaxX = maxX - svgPadding
  const graphMinY = minY + svgPadding
  const graphMaxY = maxY - svgPadding
  // graph = iStorylineInstance.scale(10, 10, windowW * 0.8, windowH / 2)
  fetch(fileUrl)
    .then(res => res.json())
    .then(storyJson => {
      const graphs = joinSubGraphs(
        storyJson,
        partition,
        false,
        graphPadding,
        graphMinX,
        graphMaxX,
        graphMinY,
        graphMaxY
      )
      console.log(graphs)
      drawSquaresAndBands(graphs, minY, maxY, graphPadding)
      const graph = graphs[0]
      const storylines = graph.storylines
      const characters = graph.characters
      storylines.forEach((storyline, idx) =>
        drawStoryline(characters[idx], storyline)
      )
    })
}

function joinSubGraphs(
  storyJson,
  partition,
  isJoint = true,
  padding = 50,
  minX = 10,
  maxX = 3010,
  minY = 10,
  maxY = 800
) {
  if (partition.length < 2) return
  // construct sub-graphs
  let graphs = []
  const width = maxX - minX
  const maxTime = partition[partition.length - 1]
  const minTime = partition[0]
  for (let t = 1, len = partition.length; t < len; t++) {
    const sTime = partition[t - 1]
    const eTime = partition[t]
    const iStorylineGenerator = new iStoryline()
    const subStoryData = constructSubStoryJson(storyJson, sTime, eTime)
    let subGraph = iStorylineGenerator.load(subStoryData)
    const graphW =
      ((width - (partition.length - 2) * padding) * (eTime - sTime)) /
      (maxTime - minTime)
    const graphH = maxY - minY
    subGraph = iStorylineGenerator.scale(minX, minY, graphW, graphH)
    graphs.push(subGraph)
  }
  // move sub graphs along X-axis
  let translateX = 0
  for (let i = 1, len = graphs.length; i < len; i++) {
    let lastGraphMinX = graphs[i - 1].timelineGuide[0]
    let lastGraphMaxX =
      graphs[i - 1].timelineGuide[graphs[i - 1].timelineGuide.length - 1]
    if (!lastGraphMaxX) lastGraphMaxX = getStorylineMaxX(graphs[i - 1])
    translateX += lastGraphMaxX - lastGraphMinX + padding
    // console.log(translateX, lastGraphMaxX)
    graphs[i].storylines.forEach(storyline => {
      if (storyline && storyline.length > 0) {
        storyline.forEach(segment => {
          if (segment && segment.length > 0) {
            segment.forEach(pt => {
              if (pt && pt.length === 2) {
                pt[0] += translateX
              }
            })
          }
        })
      }
    })
  }
  // obtain boundaries
  graphs.forEach(graph => {
    let _graphMaxX = 0
    let _graphMinX = 1e4
    graph.storylines.forEach(storyline => {
      if (storyline && storyline.length > 0) {
        storyline.forEach(segment => {
          if (segment && segment.length > 0) {
            segment.forEach(pt => {
              if (pt && pt.length === 2) {
                if (pt[0] > _graphMaxX) _graphMaxX = pt[0]
                if (pt[0] < _graphMinX) _graphMinX = pt[0]
              }
            })
          }
        })
      }
    })
    graph.minX = _graphMinX
    graph.maxX = _graphMaxX
    // console.log(_graphMaxX, _graphMinX)
  })
  // join subgraphs into the first one
  for (let i = graphs.length - 1; i >= 1; i--) {
    let graphUps = 0
    let graphDowns = 0
    let graphEquals = 0
    for (const [idx, currChar] of graphs[i].characters.entries()) {
      if (graphs[i - 1].characters.includes(currChar)) {
        const _idx = graphs[i - 1].characters.indexOf(currChar)
        let lastStoryline = graphs[i - 1].storylines[_idx]
        let lastSegment = lastStoryline[lastStoryline.length - 1]
        let currStoryline = graphs[i].storylines[idx]
        let currSegment = currStoryline[0]
        if (
          lastSegment &&
          currSegment &&
          lastSegment.length > 0 &&
          currSegment.length > 0
        ) {
          let lastPoint = lastSegment[lastSegment.length - 1]
          let currPoint = currSegment[0]
          // console.log('last:', lastPoint)
          // console.log('curr:', currPoint)
          // add connecting lines
          if (currPoint[0] - lastPoint[0] === padding && isJoint) {
            graphs[i - 1].storylines[_idx].push([lastPoint, currPoint])
          }
          // counting trends
          if (currPoint[0] - lastPoint[0] === padding) {
            if (lastPoint[1] > currPoint[1]) {
              graphDowns++
            } else if (lastPoint[1] < currPoint[1]) {
              graphUps++
            } else {
              graphEquals++
            }
          }
        }
        graphs[i - 1].storylines[_idx].push(...graphs[i].storylines[idx])
      } else {
        const newChar = currChar + idx.toString()
        graphs[i - 1].characters.push(newChar)
        graphs[i - 1].storylines.push(graphs[i].storylines[idx])
      }
    }
    graphs[i - 1].lineUps = graphUps
    graphs[i - 1].lineDowns = graphDowns
    graphs[i - 1].lineEquals = graphEquals
  }
  return graphs
}

function getStorylineMaxX(graph) {
  let maxX = 0
  graph.storylines.forEach(storyline => {
    storyline.forEach(segment => {
      segment.forEach(pt => {
        if (pt[0] >= maxX) maxX = pt[0]
      })
    })
  })
  return maxX
}

function constructSubStoryJson(storyJson, startFrame, endFrame) {
  const _charactersJson = {}
  const _locationJson = {}
  const charactersJson = storyJson['Story']['Characters']
  for (const charName in charactersJson) {
    const charItemList = charactersJson[charName]
    charItemList.forEach(charItem => {
      const sFrame = charItem.Start
      const eFrame = charItem.End
      const loc = charItem.Session
      if (startFrame <= sFrame && eFrame <= endFrame) {
        if (charName in _charactersJson) {
          _charactersJson[charName].push(charItem)
        } else {
          _charactersJson[charName] = [charItem]
        }
        _locationJson[`LOC${loc}`] = [loc]
      }
    })
  }
  return {
    Story: {
      Locations: _locationJson,
      Characters: _charactersJson,
    },
  }
}

// main('../../data/case/case1.json', [50, 1330])
// main('../../data/case/case2_50_byday.json', [0, 260])
// main('../../data/sim/Simulation-20-20-20.json', [0, 60, 140, 200])
main('../../data/sim/Simulation-50-20-20.json', [0, 80, 160, 200])
