function splitArrayIntoPairs(data) {
  // console.log('data: ', data)
  var nodes = []
  for (var i = 0; i < data.length - 1; i++) {
    nodes.push({ value: [data[i], data[i + 1]] })
  }
  return nodes
}

function buildTreeNodes(data, clusterOrder, ifMergeTogether) {
  const nodes = splitArrayIntoPairs(data)
  // console.log('splitArrayIntoPairs done, nodes: ', nodes)
  // console.log('clusterOrder: ', clusterOrder)
  // console.log('ifMergeTogether: ', ifMergeTogether)

  // console.log('nodes.length = ', nodes.length)
  while (nodes.length > 1) {
    // console.log('nodes.length = ', nodes.length)
    // console.log('nodes before: ', nodes)
    var clusterNum = clusterOrder[0]
    // console.log('clusterNum = ', clusterNum)

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
    // console.log('nodes after merge: ')
    // for (let node of nodes) {
    //   console.log(node.value)
    //   if (node.children) {
    //     for (let child of node.children) {
    //       console.log('--', child.value)
    //     }
    //   }
    // }
  }
  return nodes[0]
}

function buildTree(timeline, clusterOrder, ifMergeTogether) {
  // console.log('Enter buildTree')
  const data = buildTreeNodes(timeline, clusterOrder, ifMergeTogether)
  // console.log('buildTreeNodes done')
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

async function main() {
  const data = [
    0,
    10,
    20,
    30,
    40,
    50,
    60,
    70,
    80,
    90,
    100,
    110,
    120,
    130,
    140,
    150,
    160,
    170,
    180,
    190,
    200,
  ]
  const clusterOrder = [
    10,
    20,
    170,
    180,
    190,
    60,
    30,
    150,
    140,
    40,
    50,
    160,
    130,
    70,
    100,
    120,
    80,
    110,
    90,
  ]

  const tree = buildTree(data, clusterOrder)

  console.log('tree :>> ', tree.toString())
}

// main()

module.exports = { buildTree }
