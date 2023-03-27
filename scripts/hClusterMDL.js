const storyJson = require('../data/sim/Simulation-100-20-20.json') // storyJson
const iStoryline = require('../build/js/index')
const { buildTree } = require('./convertToTreeMDL.js')
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

const P_hat = (start, end, timeline) => {
  const nDuration = end - start
  const totalDuration = timeline[timeline.length - 1] - timeline[0]
  return nDuration / totalDuration
}

function getWeight(start, end) {
  let weight = 0
  const charactersJson = storyJson['Story']['Characters']
  let totalweight = 0
  for (const charName in charactersJson) {
    const charItemList = charactersJson[charName]
    const sFrame = charItemList[0].Start
    const length = charItemList.length
    const eFrame = charItemList[length - 1].End
    totalweight += 1
    if (eFrame > start && sFrame < end) {
      weight += 1
    }
  }
  return weight
  // return weight / totalweight
}

function calculateDat(start, end, timeline) {
  const P = P_hat(start, end, timeline)
  const weight = getWeight(start, end)
  // const Dat = -weight * Math.log2(P)
  const Dat = -weight * P * Math.log2(P)
  // console.log('weight: ', weight)
  // console.log('P: ', P)
  return Dat
}

function calculatePar(timeline, clusterNum) {
  const S = timeline.length - 1
  const K = clusterNum
  const Par = (K / 2) * Math.log2(S)
  return Par
}

function calculateVirtualParentDat(start, split, end, timeline) {
  const P1 = P_hat(start, split, timeline)
  const P2 = P_hat(split, end, timeline)
  const weight = getWeight(start, end)
  // const Dat = -weight * 2 * Math.log2((P1 + P2) / 2)
  const Dat = -weight * (P1 + P2) * 2 * Math.log2((P1 + P2) / 2)
  return Dat
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
    iStorylineInstance = new iStoryline.default()
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
    // iStorylineInstance = new iStoryline.default()
    // const currGraph = iStorylineInstance.load(d.data)

    d.value = calculateVirtualParentDat(d.start, d.split, d.end, vaildTFs)
    // console.log(d.split, d.value)

    distList.push(d)
  }
  firstLayout = [...vaildTFs]
  return { distList, firstLayout }
}

async function main() {
  var start = Date.now()

  let iStorylineInstance = new iStoryline.default()
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
  // console.log('begin clusterOrder: ', clusterOrder)

  let ifMergeTogether = new Array(clusterOrder.length).fill(0)
  // console.log('begin ifMergeTogether: ', ifMergeTogether)
  let minDist
  let prevMinDist = null
  while (distList.length > 1) {
    // finding the shortest distance between tfs
    let minDistIndex = 0
    let mergeTogether = 0
    minDist = distList[0]
    for (var i = 0; i < distList.length; i++) {
      let dist = distList[i]
      if (dist.value < minDist.value) {
        minDistIndex = i
        minDist = dist
      }
    }
    // if minDist and prevMinDist are equal and adjacent, merge them together
    if (
      prevMinDist &&
      minDist.value == prevMinDist.value &&
      minDist.start == prevMinDist.split
    ) {
      mergeTogether = 1
    }
    prevMinDist = minDist

    // after the shortest distance is found, create new layout
    firstLayout = firstLayout.filter(tf => tf != minDist.split)
    clusterOrder.push(minDist.split)
    ifMergeTogether.push(mergeTogether)
    // console.log('clusterOrder: ', clusterOrder)
    // console.log("ifMergeTogether: ", ifMergeTogether)

    // remove the original distance object
    distList = distList.filter((_, index) => index != minDistIndex)
  }

  clusterOrder.push(distList[0].split)
  if (
    prevMinDist &&
    distList[0].value == prevMinDist.value &&
    distList[0].start == prevMinDist.split
  ) {
    ifMergeTogether.push(1)
  } else {
    ifMergeTogether.push(0)
  }

  // console.log('end clusterOrder: ', clusterOrder)
  // console.log('end ifMergeTogether: ', ifMergeTogether)

  const tree = buildTree(timeline, clusterOrder, ifMergeTogether)
  for (let node of tree.preOrderTraversal()) {
    node.weight = getWeight(node.value[0], node.value[1])
  }

  // find treecut
  const treecut = findMDL(timeline, tree.root)

  var end = Date.now()
  console.log('time: ', end - start)

  let totalcrossings = 0
  let totalwiggles = 0
  let Dat = 0
  for (let tf of treecut) {
    const start = tf.value[0]
    const end = tf.value[1]
    const data = constructSubStoryJson(storyJson, start, end)
    iStorylineInstance = new iStoryline.default()
    const currGraph = iStorylineInstance.load(data)
    totalcrossings += countCrossings(currGraph.getTable('sort'))
    totalwiggles += countWiggles(currGraph.getTable('align'))
    Dat += calculateDat(start, end, timeline)
    // console.log('Dat: ', Dat)
  }
  console.log('Dat: ', Dat)
  let Par = calculatePar(timeline, treecut.length)
  console.log('Par: ', Par)
  let final_DL = Par + Dat
  console.log('total crossings: ', totalcrossings)
  console.log('total wiggles: ', totalwiggles)
  console.log('final DL: ', final_DL)

  // console.log('treecut :>> ', treecut)
  // console.log('tree :>> ', tree.toString())
  console.log('treecut :>> ')
  for (tf of treecut) {
    console.log(tf.value)
  }
  return tree
}

main()
