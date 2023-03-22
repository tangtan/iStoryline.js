const storyJson = require('../data/sim/Simulation-50-20-20.json') // storyJson
const iStoryline = require('../build/js/index')
const { buildTreeNode } = require('./convertToTreeMDL.js')

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

function splitArrayIntoPairs(data) {
  // console.log('data: ', data)
  var nodes = []
  for (var i = 0; i < data.length - 1; i++) {
    // nodes.push({ value: [data[i], data[i + 1]] })
    nodes.push([data[i], data[i + 1]])
  }
  return nodes
}

function getWeight(value) {
  let weight = 0
  const charactersJson = storyJson['Story']['Characters']
  for (const charName in charactersJson) {
    const charItemList = charactersJson[charName]
    const sFrame = charItemList[0].Start
    const length = charItemList.length
    const eFrame = charItemList[length - 1].End
    if (eFrame > value[0] && sFrame < value[1]) {
      weight += 1
    }
  }
  return weight
}

const P_hat = (node, timeline) => {
  const nDuration = node.value[1] - node.value[0]
  const totalDuration = timeline[timeline.length - 1] - timeline[0]
  return nDuration / totalDuration
}

function calculateDat(timeline, node) {
  return -node.weight * Math.log2(P_hat(node, timeline))
}

function calculateRootDat(timeline, node) {
  const rootChildrenNum = node.chilren.length
  const rootP = P_hat(node, timeline)
  const log_P = rootChildrenNum * Math.log2(rootP / rootChildrenNum)
  const weight = node.weight
  const weight1 = node.chilren.reduce((sum, n) => sum + n.weight, 0)
  return -weight * log_P
}

async function main() {
  const iStorylineInstance = new iStoryline.default()
  let fullGraph = iStorylineInstance.load(storyJson)
  const timeline = fullGraph.timeline
  // console.log('timeline: ', timeline)

  let { vaildTFs, clusterOrder } = filterValidTimeFrames(
    storyJson,
    iStorylineInstance,
    timeline
  )
  console.log('vaildTFs: ', vaildTFs)
  console.log('clusterOrder: ', clusterOrder)

  let nodes = splitArrayIntoPairs(vaildTFs)
  // console.log('nodes: ', nodes)

  let trees = []
  for (let node of nodes) {
    let treeNode = buildTreeNode(node)
    treeNode.weight = getWeight(treeNode.value)
    treeNode.Dat = calculateDat(timeline, treeNode)
    trees.push(treeNode)
    // console.log(treeNode)
    // console.log(P_hat(treeNode, timeline))
    // console.log(-Math.log2(P_hat(treeNode, timeline)))
  }
  console.log('trees: ', trees)
  let virtualParents = []
  for (var i = 0; i < trees.length - 1; i++) {
    let virtualParent = buildTreeNode([
      trees[i].value[0],
      trees[i + 1].value[1],
    ])
    virtualParent.chilren = [trees[i], trees[i + 1]]
    virtualParent.weight = getWeight(virtualParent.value)
    virtualParent.Dat = calculateRootDat(timeline, virtualParent)
    virtualParents.push(virtualParent)
  }
  for (let virtualParent of virtualParents) {
    if (
      virtualParent.Dat <
      virtualParent.chilren.reduce((sum, n) => sum + n.Dat, 0)
    ) {
      virtualParent.ifMerge = 1
    }
  }
  console.log('virtualParents: ', virtualParents)
}

main()
