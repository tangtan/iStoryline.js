const { clone } = require('lodash')

// calculate parameter description length
function calculatePar(timeline, nodes) {
  const S = timeline[timeline.length - 1] - timeline[0]
  const K = nodes[nodes.length - 1].value[1] - nodes[0].value[0]
  const res = (K / 2) * Math.log2(S)
  return res
}

// calculate data description length
function calculateDat(timeline, nodes) {
  const P_hat = n => {
    const nDuration = n.value[1] - n.value[0]
    const totalDuration = timeline[timeline.length - 1] - timeline[0]
    return nDuration / totalDuration
  }
  const res = -nodes.reduce((sum, n) => sum + Math.log(P_hat(n)), 0)
  return res
}

// calculate description length
function calculateDescriptionLength(timeline, nodes) {
  const result = calculatePar(timeline, nodes) + calculateDat(timeline, nodes)
  return result
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
  const rootModelLength = calculateDescriptionLength(timeline, [tree])
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
