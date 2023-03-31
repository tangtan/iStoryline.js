// import { logStoryInfo } from '../../src/js/utils/logger'
import { drawStoryline, drawSquares } from '../../src/js/utils/drawer'
import iStoryline from '../../src/js'

async function main(fileUrl, partition, svgPadding = 10) {
  // const iStorylineInstance = new iStoryline()
  // const fileUrl = `../../data/${fileName.split('.')[1]}/${fileName}`
  // let graph = await iStorylineInstance.loadFile(fileUrl)
  // Scale to window size
  const containerDom = document.getElementById('mySvg')
  const windowW = containerDom.clientWidth - 2 * svgPadding
  const windowH = containerDom.clientHeight - 2 * svgPadding
  const graphPadding = 50
  const minX = svgPadding
  const maxX = windowW + svgPadding
  const minY = svgPadding
  const maxY = windowH + svgPadding
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
      drawSquares(graphs, minY, maxY)
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
      ((width - (partition.length - 1) * padding) * (eTime - sTime)) /
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
    console.log(_graphMaxX, _graphMinX)
  })
  // join subgraphs into the first one
  for (let i = graphs.length - 1; i >= 1; i--) {
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
        }
        graphs[i - 1].storylines[_idx].push(...graphs[i].storylines[idx])
      } else {
        const newChar = currChar + idx.toString()
        graphs[i - 1].characters.push(newChar)
        graphs[i - 1].storylines.push(graphs[i].storylines[idx])
      }
    }
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

// main('../../data/case/case1.json', [50, 680, 1330])
main('../../data/sim/Simulation-20-20-20.json', [0, 100, 200])
