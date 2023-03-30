const storyJson = require('../data/sim/Simulation-20-20-20.json') // storyJson
const iStoryline = require('../build/js/index')

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
  const Dat = -weight * Math.log2(P)
  // const Dat = -weight * P * Math.log2(P)
  return Dat
}

function calculatePar(timeline, clusterNum) {
  const S = timeline.length - 1
  const K = clusterNum
  const Par = (K / 2) * Math.log2(S)
  return Par
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
    iStorylineInstance = new iStoryline.default()
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

class mergeResult {
  constructor(dist, ClusterNum, numOfClusters = 0, partition = []) {
    this.dist = dist
    this.ClusterNum = ClusterNum
    this.numOfClusters = numOfClusters
    this.partition = partition
  }
}

function splitArrayIntoPairs(data) {
  var nodes = []
  for (var i = 0; i < data.length - 1; i++) {
    nodes.push({ value: [data[i], data[i + 1]] })
  }
  return nodes
}

function buildTreeNodes(data, clusterOrder, ifMergeTogether, mergeResults) {
  const nodes = splitArrayIntoPairs(data)

  while (nodes.length > 1) {
    var clusterNum = clusterOrder[0]
    let mergeNum = 1
    if (ifMergeTogether[1] === 1) {
      var i = 1
      while (ifMergeTogether[i++] === 1) {
        mergeNum++
      }
    }

    for (var i = 0; i < nodes.length; i++) {
      var currNode = nodes[i]
      if (currNode.value[1] === clusterNum) {
        const newNode = {
          value: [currNode.value[0], nodes[i + mergeNum].value[1]],
          children: [currNode],
        }
        for (var j = 1; j <= mergeNum; j++) {
          newNode.children.push(nodes[i + j])
        }
        nodes[i] = newNode
        nodes.splice(i + 1, mergeNum)
        while (mergeNum--) {
          clusterOrder.shift()
          ifMergeTogether.shift()
        }
      }
    }
    for (let result of mergeResults) {
      if (result.ClusterNum == clusterNum) {
        result.numOfClusters = nodes.length
        result.partition = JSON.parse(JSON.stringify(nodes))
      }
    }
  }
  return nodes[0]
}

function buildTree(timeline, clusterOrder, ifMergeTogether, mergeResults) {
  const data = buildTreeNodes(
    timeline,
    clusterOrder,
    ifMergeTogether,
    mergeResults
  )
  const tree = new Tree(data.value, data.value)

  if (data.children) {
    for (const child of data.children) {
      buildSubTree(tree, child, tree.root)
    }
  }
  return tree
}

const buildSubTree = (tree, childData, parentNode) => {
  tree.insert(parentNode.key, childData.value)
  const node = new TreeNode(childData.value, childData.value, parentNode)
  if (childData.children) {
    for (const grandchild of childData.children) {
      buildSubTree(tree, grandchild, node)
    }
  }
}

class TreeNode {
  constructor(key, value = key, parent = null, weight = 0) {
    this.key = key
    this.value = value
    this.parent = parent
    this.children = []
    this.weight = weight
  }

  get isLeaf() {
    return this.children.length === 0
  }

  get hasChildren() {
    return !this.isLeaf
  }
}

class Tree {
  constructor(key, value = key) {
    this.root = new TreeNode(key, value)
  }

  *preOrderTraversal(node = this.root) {
    yield node
    if (node.children.length) {
      for (let child of node.children) {
        yield* this.preOrderTraversal(child)
      }
    }
  }

  *postOrderTraversal(node = this.root) {
    if (node.children.length) {
      for (let child of node.children) {
        yield* this.postOrderTraversal(child)
      }
    }
    yield node
  }

  insert(parentNodeKey, key, value = key) {
    for (let node of this.preOrderTraversal()) {
      if (node.key === parentNodeKey) {
        node.children.push(new TreeNode(key, value, node))
        return true
      }
    }
    return false
  }

  remove(key) {
    for (let node of this.preOrderTraversal()) {
      const filtered = node.children.filter(c => c.key !== key)
      if (filtered.length !== node.children.length) {
        node.children = filtered
        return true
      }
    }
    return false
  }

  find(key) {
    for (let node of this.preOrderTraversal()) {
      if (node.key === key) return node
    }
    return undefined
  }

  toString(node = this.root, level = 0) {
    let result = ''
    result += `${'| '.repeat(level)}${node.value}\n`
    for (let child of node.children) {
      result += this.toString(child, level + 1)
    }
    return result
  }
}

// select treecut by L_method
// find 2 linear models to fit the curve, with min rmse
function L_method(mergeResults) {
  let k = 1
  let minError = Number.MAX_VALUE
  const points = mergeResults
    .reverse()
    .map(obj => ({ x: obj.numOfClusters, y: obj.dist }))
  const eq = linearRegression(points)
  for (let i = 2; i < points.length - 1; i++) {
    let l_points = points.slice(0, i)
    let r_points = points.slice(i, points.length)
    let l_eq = linearRegression(l_points)
    let r_eq = linearRegression(r_points)
    let l_error = rmse(l_points, l_eq)
    let r_error = rmse(r_points, r_eq)
    let error_tmp =
      (l_error * i) / points.length +
      (r_error * (points.length - i)) / points.length
    if (error_tmp < minError) {
      minError = error_tmp
      k = i
    }
  }

  let error_all = rmse(points, eq)
  if (error_all < minError) {
    minError = error_all
    k = points.length - 1
  }

  let L_cut
  for (let mergeResult of mergeResults) {
    if (mergeResult.numOfClusters === k) {
      L_cut = mergeResult.partition
    }
  }
  return L_cut
}

function rmse(points, eq) {
  // root-mean-squared error
  const n = points.length
  let sumError = 0
  for (let i = 0; i < n; i++) {
    const pred_y = eq.slope * points[i].x + eq.intercept
    const error = pred_y - points[i].y
    sumError += error * error
  }
  const rmse = Math.sqrt(sumError / n)
  return rmse
}

function linearRegression(points) {
  var xSum = 0
  var ySum = 0
  var xySum = 0
  var xxSum = 0
  var count = points.length

  for (var i = 0; i < count; i++) {
    var x = points[i].x
    var y = points[i].y
    xSum += x
    ySum += y
    xySum += x * y
    xxSum += x * x
  }

  var slope = (count * xySum - xSum * ySum) / (count * xxSum - xSum * xSum)
  var intercept = ySum / count - (slope * xSum) / count

  return { slope, intercept }
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

  let mergeResults = []
  let ifMergeTogether = new Array(clusterOrder.length).fill(0)
  let minDist
  let prevMinDist = null

  for (let clusterNum of clusterOrder) {
    mergeResults.push(new mergeResult(0, clusterNum))
  }
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

    mergeResults.push(new mergeResult(minDist.value, minDist.split))

    // recalculate the distance between the new timeframe and the its left and right timeframes
    const updateDistance = (
      distList,
      minDistIndex,
      storyJson,
      iStorylineInstance
    ) => {
      // console.log('in updateDistance')
      const updateDistanceValue = (d, start, end) => {
        const currData = constructSubStoryJson(storyJson, start, end)
        iStorylineInstance = new iStoryline.default()
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
    updateDistance(distList, minDistIndex, storyJson, iStorylineInstance)

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

  mergeResults.push(new mergeResult(distList[0].value, distList[0].split))

  const tree = buildTree(timeline, clusterOrder, ifMergeTogether, mergeResults)
  for (let node of tree.preOrderTraversal()) {
    node.weight = getWeight(node.value[0], node.value[1])
  }

  // find treecut
  const treecut = L_method(mergeResults)

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
  }
  let Par = calculatePar(timeline, treecut.length)
  let final_DL = Par + Dat
  console.log('total crossings: ', totalcrossings)
  console.log('total wiggles: ', totalwiggles)
  console.log('final DL: ', final_DL)

  // console.log('tree :>> ', tree.toString())
  let partition = []
  partition.push(treecut[0].value[0])
  // console.log('treecut :>> ')
  for (tf of treecut) {
    // console.log(tf.value)
    partition.push(tf.value[1])
  }
  console.log('partition: ', partition)

  return tree
}

main()
