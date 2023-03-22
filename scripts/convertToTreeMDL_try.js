class TreeNode {
  constructor(key, value = key, parent = null, weight = 0) {
    this.key = key
    this.value = value // start and end
    this.weight = weight // num of people in the time frame
    this.Dat = 0 // part of discription length
    this.parent = parent
    this.chilren = []
    this.ifMerge = 0
  }

  get isLeaf() {
    return this.chilren.length === 0
  }

  get hasChildren() {
    return !this.isLeaf
  }
}

function buildTreeNode(key, value = key, parent = null, weight = 0) {
  return new TreeNode(key, value, parent, weight)
}

async function main() {
  let node = buildTreeNode([10, 30])
  console.log('node: ', node)
}

// main()

module.exports = { buildTreeNode }
