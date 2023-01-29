const iStoryline = require('../build/js/index')
const storyJson = require('../data/sim/Simulation-50-20-20.json') // storyJson

// constructing sub json data
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

function calculateDistBtwnAdjTimeframes(orderTable, alignTable) {
  const crossings = countCrossings(orderTable)
  const wiggles = countWiggles(alignTable)
  const res = 0.6 * crossings + 0.4 * wiggles
  return res
}

async function main() {
  const iStorylineInstance = new iStoryline.default()
  let fullGraph = iStorylineInstance.load(storyJson)
  const timeline = fullGraph.timeline

  let distList = []
  let hClusterLayout = []
  let currTimeline = timeline

  // creating first layout & full distance list
  for (let idx = 0; idx < timeline.length - 2; idx++) {
    const d = {
      start: timeline[idx],
      split: timeline[idx + 1],
      end: timeline[idx + 2],
    }
    d.data = constructSubStoryJson(storyJson, d.start, d.end)

    const currGraph = iStorylineInstance.load(d.data)
    d.value = calculateDistBtwnAdjTimeframes(
      currGraph.getTable('sort'),
      currGraph.getTable('align')
    )

    distList.push(d)
  }
  hClusterLayout.push({ layout: 0, tfs: currTimeline })

  let minDist
  let layoutLevel = 1
  while (distList.length > 1) {
    // finding the shortest distance between tfs
    let minDistIndex = 0
    minDist = distList.reduce((prev, cur, index) => {
      if (cur.value < prev.value) {
        minDistIndex = index
        return cur
      } else {
        return prev
      }
    })

    // after the shortest distance is found, create new layout
    currTimeline = currTimeline.filter(tf => tf != minDist.split)
    hClusterLayout.push({ layout: layoutLevel, tfs: currTimeline })
    layoutLevel += 1

    // recalculate the distance between the new timeframe and the its left and right timeframes
    const updateDistance = (
      distList,
      minDistIndex,
      storyJson,
      iStorylineInstance
    ) => {
      const updateDistanceValue = (d, start, end) => {
        const currData = constructSubStoryJson(storyJson, start, end)
        const currGraph = iStorylineInstance.load(currData)
        d.value = calculateDistBtwnAdjTimeframes(
          currGraph.getTable('sort'),
          currGraph.getTable('align')
        )
      }

      if (minDistIndex !== 0) {
        let leftDist = distList[minDistIndex - 1]
        leftDist.split = minDist.start
        leftDist.end = minDist.end
        updateDistanceValue(leftDist, leftDist.start, leftDist.end)
      }

      if (minDistIndex !== distList.length - 1) {
        let rightDist = distList[minDistIndex + 1]
        rightDist.start = minDist.start
        rightDist.split = minDist.end
        updateDistanceValue(rightDist, rightDist.start, rightDist.end)
      }
    }

    // remove the original distance object
    distList = distList.filter((_, index) => index != minDistIndex)
  }

  hClusterLayout.push({
    layout: layoutLevel,
    tfs: [timeline[0], timeline[timeline.length - 1]],
  })

  console.log('final order', hClusterLayout)
  return hClusterLayout
}

main()
