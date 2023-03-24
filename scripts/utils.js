const fs = require('fs')
const { createCanvas } = require('canvas')
const iStoryline = require('../build/js/index')
const storyJson = require('../data/sim/Simulation-50-20-20.json') // storyJson

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

function countCrossings(graph) {
  const table = graph.getTable('sort')
  let count = 0
  for (let frame = 1; frame < table.cols; frame++) {
    const left = frame - 1
    const right = frame
    for (let i = 0; i < table.rows; i++) {
      for (let j = i + 1; j < table.rows; j++) {
        if (
          table.value(i, left) *
            table.value(j, left) *
            table.value(i, right) *
            table.value(j, right) >
          0
        ) {
          if (
            (table.value(i, left) - table.value(j, left)) *
              (table.value(i, right) - table.value(j, right)) <
            0
          ) {
            count++
          }
        }
      }
    }
  }
  return count
}

function countWiggles(graph) {
  const table = graph.getTable('align')
  let wiggles = 0
  for (let char = 0; char < table.rows; char++) {
    for (let frame = 0; frame < table.cols - 1; frame++) {
      if (table.value(char, frame) * table.value(char, frame + 1) > 0) {
        if (table.value(char, frame) !== table.value(char, frame + 1)) {
          wiggles++
        }
      }
    }
  }
  return wiggles
}

function writeJsonFile(jsonData, fileName = 'test') {
  // convert JSON object to a string
  const data = JSON.stringify(jsonData)
  // write file to disk
  fs.writeFile(`./${fileName}.json`, data, 'utf8', err => {
    if (err) {
      console.log(`Error writing file: ${err}`)
    } else {
      console.log(`File is written successfully!`)
    }
  })
}

function saveStorylineImage(graph, imgName = 'test', imgW = 5000, imgH = 5000) {
  // init canvas
  const canvas = createCanvas(imgW, imgH)
  const ctx = canvas.getContext('2d')
  const drawSegement = points => {
    if (points.length < 2) return
    ctx.beginPath()
    ctx.moveTo(points[0][0], points[0][1])
    for (let i = 1; i < points.length; i++) {
      ctx.lineTo(points[i][0], points[i][1])
    }
    ctx.strokeStyle = 'green'
    ctx.stroke()
  }

  graph.storylines.forEach(_segments => {
    _segments.forEach(_points => drawSegement(_points))
  })
  const imgOut = fs.createWriteStream(__dirname + `/${imgName}.png`)
  const imgStream = canvas.createPNGStream()
  imgStream.pipe(imgOut)
  imgOut.on('finish', () => console.log('The PNG file was created.'))
}

function drawJointSubGraphs(
  storyJson,
  partition,
  isJoint = true,
  width = 3000,
  padding = 100,
  minY = 10,
  maxY = 800
) {
  if (partition.length < 2) return
  // construct sub-graphs
  let graphs = []
  const maxTime = partition[partition.length - 1]
  const minTime = partition[0]
  for (let t = 1, len = partition.length; t < len; t++) {
    const sTime = partition[t - 1]
    const eTime = partition[t]
    const iStorylineGenerator = new iStoryline.default()
    const subStoryData = constructSubStoryJson(storyJson, sTime, eTime)
    let subGraph = iStorylineGenerator.load(subStoryData)
    const graphW =
      ((width - (partition.length - 1) * padding) * (eTime - sTime)) /
      (maxTime - minTime)
    const graphH = maxY - minY
    subGraph = iStorylineGenerator.scale(0, minY, graphW, graphH)
    graphs.push(subGraph)
  }
  // move sub graphs along X-axis
  let translateX = 0
  for (let i = 1, len = graphs.length; i < len; i++) {
    let lastGraphMinX = graphs[i - 1].timelineGuide[0]
    let lastGraphMaxX =
      graphs[i - 1].timelineGuide[graphs[i - 1].timelineGuide.length - 1]
    translateX += lastGraphMaxX - lastGraphMinX + padding
    graphs[i].storylines.forEach(storyline => {
      storyline.forEach(segment => {
        segment.forEach(pt => {
          pt[0] += translateX
        })
      })
    })
  }
  // join subgraphs into the first one
  for (let i = graphs.length - 1; i >= 1; i--) {
    for (const [idx, currChar] of graphs[i].characters.entries()) {
      if (graphs[i - 1].characters.includes(currChar)) {
        const _idx = graphs[i - 1].characters.indexOf(currChar)
        let lastStoryline = graphs[i - 1].storylines[_idx]
        let lastSegment = lastStoryline[lastStoryline.length - 1]
        let lastPoint = lastSegment[lastSegment.length - 1]
        let currStoryline = graphs[i].storylines[idx]
        let currSegment = currStoryline[0]
        let currPoint = currSegment[0]
        // console.log('last:', lastPoint)
        // console.log('curr:', currPoint)
        // add connecting lines
        if (currPoint[0] - lastPoint[0] === padding && isJoint) {
          graphs[i - 1].storylines[_idx].push([lastPoint, currPoint])
        }
        graphs[i - 1].storylines[_idx].push(...graphs[i].storylines[idx])
      } else {
        const newChar = currChar + idx.toString()
        graphs[i - 1].characters.push(newChar)
        graphs[i - 1].storylines.push(graphs[i].storylines[idx])
      }
    }
  }
  saveStorylineImage(graphs[0], 'subs')
}

// Main
const iStorylineInstance = new iStoryline.default()
let graph0 = iStorylineInstance.load(storyJson)
graph0 = iStorylineInstance.scale(0, 10, 3000, 800) // 对照
saveStorylineImage(graph0, 'full')

drawJointSubGraphs(storyJson, [0, 60, 80, 100, 120, 200], false)
