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

function countCrossings(table) {
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

function countWiggles(table) {
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

function writeJsonFile(jsonData) {
  // convert JSON object to a string
  const data = JSON.stringify(jsonData)
  // write file to disk
  fs.writeFile('./test.json', data, 'utf8', err => {
    if (err) {
      console.log(`Error writing file: ${err}`)
    } else {
      console.log(`File is written successfully!`)
    }
  })
}

const subStoryJson = constructSubStoryJson(storyJson, 0, 60)

// init canvas
const canvas = createCanvas(1000, 1000)
const ctx = canvas.getContext('2d')

// obtain storylines
const iStorylineInstance = new iStoryline.default()
const graph = iStorylineInstance.load(subStoryJson)
const orderTable = graph.getTable('sort')
const crossings = countCrossings(orderTable)
const alignTable = graph.getTable('align')
const wiggles = countWiggles(alignTable)
console.log(graph.timeline, crossings, wiggles)

// draw
function drawSegement(points) {
  if (points.length < 2) return
  ctx.beginPath()
  ctx.moveTo(points[0][0], points[0][1])
  for (let i = 1; i < points.length; i++) {
    ctx.lineTo(points[i][0], points[i][1])
  }
  ctx.strokeStyle = 'green'
  ctx.stroke()
}

// graph = iStorylineInstance.scale(10, 10, 1000 * 0.8, 1000 / 2)
// graph.storylines.forEach(_segments => {
//   _segments.forEach(_points => drawSegement(_points))
// })

// output
// const out = fs.createWriteStream(__dirname + '/test.png')
// const stream = canvas.createPNGStream()
// stream.pipe(out)
// out.on('finish', () =>  console.log('The PNG file was created.'))
