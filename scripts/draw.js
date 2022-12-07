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

constructSubStoryJson(storyJson, 0, 20)

// init canvas
const canvas = createCanvas(1000, 1000)
const ctx = canvas.getContext('2d')

// obtain storylines
// const iStorylineInstance = new iStoryline.default()
// let graph = iStorylineInstance.load(storyJson)
// console.log(graph.timeline)

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
