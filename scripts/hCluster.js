const storyJson = require('../data/sim/Simulation-50-20-20.json') // storyJson
const iStoryline = require('../build/js/index')
const { buildTree } = require('./convertToTree.js')
const { findMDL } = require('./selectTreecut.js')

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

// Function to filter out valid timeframes
function filterValidTimeFrames(storyJson, iStorylineInstance, timeline) {
  let clusterOrder = []
  let vaildTFs = timeline
  const currTF = { start: 0, spilt: 1, end: 2 }
  const n = timeline.length - 2
  for (let idx = 0; idx < n; idx++) {
    const currTFData = constructSubStoryJson(
      storyJson,
      timeline[currTF.start],
      timeline[currTF.end]
    )
    const currTable = iStorylineInstance.load(currTFData).getTable('sort')
    const crossing = countCrossings(currTable)
    if (crossing === 0) {
      vaildTFs = vaildTFs.filter(tf => tf !== timeline[currTF.spilt])
      clusterOrder.push(timeline[currTF.spilt])
      currTF.spilt = currTF.end
      currTF.end = currTF.end + 1
    } else {
      currTF.start = currTF.spilt
      currTF.spilt = currTF.end
      currTF.end = currTF.end + 1
    }
  }
  return { vaildTFs, clusterOrder }
}

// Function to create first layout and full distance list
function createFirstLayoutAndFullDistanceList(
  storyJson,
  iStorylineInstance,
  vaildTFs
) {
  const distList = []
  let firstLayout = []
  for (let idx = 0; idx < vaildTFs.length - 2; idx++) {
    const d = {
      start: vaildTFs[idx],
      split: vaildTFs[idx + 1],
      end: vaildTFs[idx + 2],
    }
    d.data = constructSubStoryJson(storyJson, d.start, d.end)

    const currGraph = iStorylineInstance.load(d.data)
    d.value = calculateDistBtwnAdjTimeframes(
      currGraph.getTable('sort'),
      currGraph.getTable('align')
    )

    distList.push(d)
  }
  firstLayout = [...vaildTFs]
  return { distList, firstLayout }
}

async function main() {
  const iStorylineInstance = new iStoryline.default()
  let fullGraph = iStorylineInstance.load(storyJson)
  const timeline = fullGraph.timeline

  let { vaildTFs, clusterOrder } = filterValidTimeFrames(
    storyJson,
    iStorylineInstance,
    timeline
  )

  let { distList, firstLayout } = createFirstLayoutAndFullDistanceList(
    storyJson,
    iStorylineInstance,
    vaildTFs
  )

  let minDist
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
    firstLayout = firstLayout.filter(tf => tf != minDist.split)
    clusterOrder.push(minDist.split)

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
  clusterOrder.push(distList[0].split)

  const tree = buildTree(timeline, clusterOrder)

  // find treecut
  const treecut = findMDL(timeline, tree.root)

  console.log('treecut :>> ', treecut)
  return tree
}

main()
