import { Table } from '../data/table'
import { ORDER_TIMES } from '../utils/CONSTANTS'

export function greedySort(story, constraints) {
  const params = getParams(story, constraints)
  const sortTable = runAlgorithm(params, story.characters)
  story.setTable('sort', sortTable)
}

/**
 * Convert story data into algorithm params
 * @param {Story} story
 * @param {Constraint[]} constraints
 * @return [V, C][]
 */
function getParams(story, constraints) {
  const sessionTable = story.getTable('session')
  const charactersLength = story.getTableRows()
  const timeStepsLength = story.getTableCols()
  const params = []
  // Trasverse sessions
  for (let _step = 0; _step < timeStepsLength; _step++) {
    const vertexs = []
    for (let _char = 0; _char < charactersLength; _char++) {
      const sessionID = sessionTable.value(_char, _step)
      const charName = story.characters[_char]
      if (sessionID > 0) {
        const _vertex = new Vertex(charName, sessionID, _char)
        let flag = true
        for (let i = 0; i < vertexs.length; i++) {
          if (vertexs[i].sessionID === sessionID) {
            vertexs[i].list.push(_vertex)
            flag = false
            break
          }
        }
        if (flag) {
          vertexs.push(_vertex)
        }
      }
    }
    params.push([vertexs, []]) // [V, C]
  }
  // Trasverse constraints
  constraints.forEach(ctr => {
    if (ctr.style === 'Sort') {
      const [srcCharName, endCharName] = ctr.names
      const [startTimeStamp, endTimeStamp] = ctr.timeSpan
      const startTimeStep = story.getTimeStep(startTimeStamp)
      const endTimeStep = story.getTimeStep(endTimeStamp)
      if (
        startTimeStep !== null &&
        endTimeStep !== null &&
        endTimeStep >= startTimeStep
      ) {
        for (let _step = startTimeStep; _step < endTimeStep; _step++) {
          const paramsInStep = params[_step]
          const vertexs = paramsInStep[0]
          const srcVertex = findCharacterVertex(srcCharName, vertexs)
          const endVertex = findCharacterVertex(endCharName, vertexs)
          if (srcVertex && endVertex) {
            const vertexPair = new VertexPair(srcVertex, endVertex)
            paramsInStep[1].push(vertexPair)
          }
        }
      }
    }
  })
  return params
}

/**
 * Invoke algorithm module
 * @param {[V, C][]} params
 * @param {string[]} characters
 * @return {Table} sortTable
 */
function runAlgorithm(params, characters) {
  for (let orderTime = 0; orderTime < ORDER_TIMES; orderTime++) {
    // Forward sorting
    for (let i = 0; i < params.length - 1; i++) {
      const V1 = params[i][0]
      const V2 = params[i + 1][0]
      const C = params[i + 1][1]
      constrainedCrossingReduction(V1, V2, C)
    }
    // Backward sorting
    for (let i = params.length - 1; i > 0; i--) {
      const V1 = params[i][0]
      const V2 = params[i - 1][0]
      const C = params[i - 1][1]
      constrainedCrossingReduction(V1, V2, C)
    }
  }
  // Update permutation
  const ans = []
  characters.forEach(charName => {
    const charOrders = []
    for (let col = 0; col < params.length; col++) {
      const vertexs = params[col][0]
      const _vertex = findCharacterVertex(charName, vertexs)
      if (_vertex) {
        charOrders.push(_vertex.order + 1) // 0 is invalid in sortTable
      } else {
        charOrders.push(0)
      }
    }
    ans.push(charOrders)
  })
  return new Table(ans)
}

/**
 * CONSTRAINED-CROSSING-REDUCTION
 * https://link.springer.com/chapter/10.1007/978-3-540-31843-9_22
 * @param {Vertex[]} V1 anchored vertex list (position fixed)
 * @param {Vertex[]} V2 vertex list to be reordered
 * @param {VertexPair[]} C constrained orders of V2
 * @return {Vertex[]} permutation of V2
 */
function constrainedCrossingReduction(V1, V2, ctrs) {
  let ans = []
  // Init orders
  V2.forEach(vertex => {
    vertex.list.sort(
      (a, b) => a.getBarycenterLeaf(V1) - b.getBarycenterLeaf(V1)
    )
  })
  // Sort V2 to satisfy inner-group constraints
  for (let i = 0, len = ctrs.length; i < len; i++) {
    const srcVert = ctrs[i].srcVertex
    const endVert = ctrs[i].endVertex
    const [srcVertRoot, srcVertIdx] = findRootCharacterVertex(srcVert.name, V2)
    const [endVertRoot, endVertIdx] = findRootCharacterVertex(endVert.name, V2)
    if (srcVertRoot && endVertRoot && srcVertRoot.name === endVertRoot.name) {
      if (srcVertIdx > endVertIdx) {
        ;[srcVertRoot.list[srcVertIdx], srcVertRoot.list[endVertIdx]] = [
          srcVertRoot.list[endVertIdx],
          srcVertRoot.list[srcVertIdx],
        ]
      }
    }
  }
  // Sort V2 to satisfy inter-group constraints
  let C = filterInnerGroupConstraints(ctrs, V2)
  let V = generateConstrainedVertexs(C)
  let _V = generateUnconstrainedVertexs(V2, V)
  let [vertex1, vertex2] = findViolatedContraint(V, C, V1)
  while (vertex1 && vertex2) {
    let _vertex1 = new Vertex()
    _vertex1.list = vertex1.list.concat(vertex2.list)
    C.forEach(vertexPair => {
      if (
        vertexPair.srcVertex.name === vertex2.name ||
        vertexPair.srcVertex.name === vertex1.name
      ) {
        vertexPair.srcVertex = _vertex1
      }
      if (
        vertexPair.endVertex.name === vertex2.name ||
        vertexPair.endVertex.name === vertex1.name
      ) {
        vertexPair.endVertex = _vertex1
      }
    })
    // Remove satisfied constraints
    C = C.filter(
      vertexPair => vertexPair.srcVertex.name !== vertexPair.endVertex.name
    )
    V = V.filter(
      vertex => vertex.name !== vertex2.name && vertex.name !== vertex1.name
    )
    if (_vertex1.hasConstraints(C)) {
      V.push(_vertex1)
    } else {
      _V.push(_vertex1)
    }
    ;[vertex1, vertex2] = findViolatedContraint(V, C, V1)
  }
  // Sort by barycenter values
  const VComp = _V.concat(V)
  VComp.sort((a, b) => a.getBarycenterRoot(V1) - b.getBarycenterRoot(V1))
  VComp.forEach(vertex => {
    ans = ans.concat(vertex.list)
  })
  // Update V2 orders
  ans.forEach((vert, idx) => {
    vert.order = idx
    const vertInV2 = findCharacterVertex(vert.name, V2)
    if (vertInV2) vertInV2.order = idx
  })
}

function findViolatedContraint(V, C, V1) {
  for (let i = 0, len = C.length; i < len; i++) {
    const pair = C[i]
    if (
      pair.srcVertex.getBarycenterRoot(V1) >=
      pair.endVertex.getBarycenterRoot(V1)
    ) {
      return [pair.srcVertex, pair.endVertex]
    } else {
      pair.srcVertex = pair.endVertex
    }
  }
  return [null, null]
}

function filterInnerGroupConstraints(C, V2) {
  let interGroupCtrs = []
  for (let i = 0, len = C.length; i < len; i++) {
    const pair = C[i]
    const [srcVertRoot, srcVertIdx] = findRootCharacterVertex(
      pair.srcVertex.name,
      V2
    )
    const [endVertRoot, endVertIdx] = findRootCharacterVertex(
      pair.endVertex.name,
      V2
    )
    if (srcVertRoot && endVertRoot) {
      if (srcVertRoot.name !== endVertRoot.name) {
        const newPair = new VertexPair(srcVertRoot, endVertRoot)
        interGroupCtrs.push(newPair)
      }
    }
  }
  return interGroupCtrs
}

function generateConstrainedVertexs(C) {
  let V = []
  let charsInV = []
  C.forEach(pair => {
    if (pair.srcVertex && pair.endVertex) {
      if (pair.srcVertex.name !== pair.endVertex.name) {
        if (charsInV.indexOf(pair.srcVertex.name) === -1) {
          V.push(pair.srcVertex)
          charsInV.push(pair.srcVertex.name)
        }
      }
      if (charsInV.indexOf(pair.endVertex.name) === -1) {
        V.push(pair.endVertex)
        charsInV.push(pair.endVertex.name)
      }
    }
  })
  return V
}

function generateUnconstrainedVertexs(V2, V) {
  const constrainedCharacters = V.map(_ => _.name)
  return V2.filter(vertex => constrainedCharacters.indexOf(vertex.name) === -1)
}

class Vertex {
  constructor(name, sessionID, order) {
    this.name = name || 'dummy' // storyline character name, only valid when list.length === 1
    this.sessionID = sessionID || 0 // storyline sessionID (must be positive)
    this.order = order || 0 // permutation starts from 0
    this.list = [this] // vertex list at least contain one vertex
  }

  // The way to calculate Barycenter has a significant impact on sorting results.
  getBarycenterRoot(vertexs) {
    const _list = this.list.map(_ => findCharacterVertex(_.name, vertexs))
    let barycenter = 0
    _list.forEach(vertex => {
      if (vertex) barycenter += vertex.order
    })
    return barycenter / this.degree
  }

  getBarycenterLeaf(vertexs) {
    const vertex = findCharacterVertex(this.name, vertexs)
    return vertex ? vertex.order : this.order
  }

  hasConstraints(C) {
    for (let i = 0, len = C.length; i < len; i++) {
      const pair = C[i]
      if (
        pair.srcVertex.name === this.name ||
        pair.endVertex.name === this.name
      ) {
        return true
      }
    }
    return false
  }

  clone() {
    const _vertex = new Vertex(this.name, this.sessionID, this.order)
    _vertex.list = this.list
    return _vertex
  }

  get degree() {
    return this.list.length
  }
}

// Src vertex must be ahead of end vertex
class VertexPair {
  constructor(srcVertex, endVertex) {
    this.srcVertex = srcVertex
    this.endVertex = endVertex
  }
}

function findCharacterVertex(char, V) {
  for (let i = 0; i < V.length; i++) {
    for (let j = 0; j < V[i].list.length; j++) {
      if (V[i].list[j].name === char) {
        return V[i].list[j]
      }
    }
  }
  return null
}

function findRootCharacterVertex(char, V) {
  for (let i = 0; i < V.length; i++) {
    for (let j = 0; j < V[i].list.length; j++) {
      if (V[i].list[j].name === char) {
        return [V[i], j]
      }
    }
  }
  return [null, -1]
}
