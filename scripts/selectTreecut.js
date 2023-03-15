const { clone } = require('lodash')

// calculate parameter description length
function calculatePar(timeline, nodes) {
  // const S = timeline[timeline.length - 1] - timeline[0]
  // const K = nodes[nodes.length - 1].value[1] - nodes[0].value[0]
  const S = timeline.length - 1
  const K = nodes.length
  const res = (K / 2) * Math.log2(S)
  return res
}

const P_hat = (n, timeline) => {
  const nDuration = n.value[1] - n.value[0]
  const totalDuration = timeline[timeline.length - 1] - timeline[0]
  return nDuration / totalDuration
}

// calculate data description length
function calculateDat(timeline, nodes) {
  return -nodes.reduce((sum, n) => sum + Math.log2(P_hat(n, timeline)), 0)
}

// calculate data description length for the node itself
function calculateRootDat(timeline, nodes) {
  const rootNode = nodes[0]
  const rootChildrenNum = rootNode.children.length
  // assume evenly distribution
  const rootP = P_hat(rootNode, timeline)
  return -rootChildrenNum * Math.log2(rootP / rootChildrenNum)
}

// calculate description length
function calculateDescriptionLength(timeline, nodes) {
  return calculatePar(timeline, nodes) + calculateDat(timeline, nodes)
}

function calculateRootDescriptionLength(timeline, nodes) {
  return calculatePar(timeline, nodes) + calculateRootDat(timeline, nodes)
}

const findMDL = (timeline, tree) => {
  // Check if the current node is a leaf node
  if (tree.children.length === 0) {
    return [tree]
  }

  // Recursively find the optimal model for each child subtree
  let optimalModels = []
  for (let i = 0; i < tree.children.length; i++) {
    const childModels = findMDL(timeline, tree.children[i])
    optimalModels = optimalModels.concat(childModels)
  }

  // Check if collapsing the lower-level optimal models reduces the description length
  const rootModelLength = calculateRootDescriptionLength(timeline, [tree])
  // const rootModelLength = calculateDescriptionLength(timeline, [tree])
  const optimalModelLength = calculateDescriptionLength(timeline, optimalModels)
  console.log('rootModelLength :>> ', rootModelLength)
  console.log('optimalModelLength :>> ', optimalModelLength)
  if (rootModelLength < optimalModelLength) {
    console.log('return root :>> ')
    return [tree]
  } else {
    console.log('return optimalModels')
    return optimalModels
  }
}

module.exports = { findMDL }
