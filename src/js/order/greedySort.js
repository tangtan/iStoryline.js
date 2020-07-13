import { Table } from '../data/table'
import { i, or } from 'mathjs'
import { constant } from 'lodash'
import { DisjointSet } from '../utils/dataStruct'
import { constants } from '../data/constraint'

const ORDERTIME = 10

/**
 * @param {Story} story
 * @param {Number[][]} constraints
 */

export function greedySort(story, constraints) {
  const param = getParam(story, constraints)
  const sortTable = runAlgorithms(param)
  story.setTable('sort', sortTable)
}

/**
 *
 * @param {Story} story
 * @param {Number[][]} constraints
 * @returns {Object}
 */
function getParam(story, constraints) {
  //console.log(story);
  let storySessionTable = story.getTable('session')
  // let [height, width] = storySessionTable.mat.size()
  let height = storySessionTable.rows
  let width = storySessionTable.cols
  let charaterinSession = []
  //console.log(height,width)
  for (let time = 0; time < width; time++) {
    charaterinSession.push([])
    //add a time stamp
    let sessionMap = new Map()
    let sessionHash = 0
    for (let characterID = 0; characterID < height; characterID++) {
      let sessionID = storySessionTable.value(characterID, time)
      if (sessionID !== 0 && !sessionMap.has(sessionID)) {
        sessionMap.set(sessionID, sessionHash)
        sessionHash += 1
        charaterinSession[time].push([characterID])
        //add a session at this time stamp
      } else if (sessionID !== 0) {
        charaterinSession[time][sessionMap.get(sessionID)].push(characterID)
      }
    }
  }
  //console.log(charaterinSession)
  constraints = constraints.constraints
  let constantSort = constraints.filter(constraint => {
    return constraint.style === 'Sort'
  })
  let constraintAtAllTime = []
  for (let time = 0; time < width; time++) {
    let constraintAtThisTime = []
    for (let constraint of constantSort) {
      if (time >= constraint.timeSpan[0] && time <= constraint.timeSpan[1]) {
        let names = constraint.names
        constraintAtThisTime.push([
          story.getCharacterID(names[0]),
          story.getCharacterID(names[1]),
        ])
      }
    }
    constraintAtAllTime.push(constraintAtThisTime)
  }
  return {
    charaterinSession,
    height,
    width,
    constraints: constraintAtAllTime,
    //TODO:TODOTODOTODOTODO
  }
}

/**
 *
 * @param {Number[]} order
 * @param {Number} height 多少人
 * @returns {Number[]}
 */
function order2mat(order, height) {
  let ans = []
  for (let ID = 0; ID < height; ID++) {
    let orderID = order.indexOf(ID) + 1
    ans.push(orderID) //0代表不存在
  }
  return ans
}

/**
 *
 * @param {Object} param
 * @returns {Table}
 */
function runAlgorithms(param) {
  let ans = new Table()
  let { height, width, charaterinSession, constraints } = param
  //console.log(charaterinSession);
  ans.resize(height, width)
  let initOrder = constrainedCrossingReduction(
    charaterinSession[0],
    charaterinSession[0],
    constraints[0]
  )
  let initOrderMat = order2mat(initOrder, height)
  //console.log(initOrder)
  //console.log(initOrderMat)
  let replaceIndex = []
  for (let i = 0; i < height; i++) replaceIndex.push(i)
  ans.replace(replaceIndex, 0, initOrderMat)
  //console.log(ans)
  let lastTimeOrder = initOrder
  for (let ordertime = 0; ordertime < ORDERTIME; ordertime++) {
    //from the beginning to the end
    for (let time = 1; time < width; time++) {
      let thisTimeOrder = constrainedCrossingReduction(
        charaterinSession[time],
        lastTimeOrder,
        constraints[time]
      )
      let thisTimeOrderMat = order2mat(thisTimeOrder, height)
      //console.log("time",time,thisTimeOrderMat)
      ans.replace(replaceIndex, time, thisTimeOrderMat)
      lastTimeOrder = thisTimeOrder
    }
    //from the end to the beginning
    for (let time = width - 2; time >= 0; time--) {
      let thisTimeOrder = constrainedCrossingReduction(
        charaterinSession[time],
        lastTimeOrder,
        constraints[time]
      )
      let thisTimeOrderMat = order2mat(thisTimeOrder, height)
      //console.log("time",time,thisTimeOrderMat)
      ans.replace(replaceIndex, time, thisTimeOrderMat)
      lastTimeOrder = thisTimeOrder
    }
  }
  //console.log(ans)
  return ans
}

/**
 * @param {Number[][]} list1 第一个维度是集合，第二个维度是集合的元素
 * @param {Number[]} list2 元素的权重顺序
 * @param {Number[][]} constraints  元素的顺序约束
 * @return {Number[]} orderList  元素的顺序
 * @example   let list1=[[1,2,3],[5,6,4],[55,63]];
              let list2=[4,63,55,3,5,6,2,1];
              let constraints=[[5,1],[1,55],[3,2],[1,3]];
 */

export function constrainedCrossingReduction(list1, list2, constraints = []) {
  let list1Weight = []
  for (let arr of list1) {
    let sumWeight = 0
    for (let element of arr) {
      sumWeight += getWeight(element, list2)
    }
    list1Weight.push(sumWeight / arr.length)
  }
  let [mapSetArr, setInDegree] = dealSetConstraints(
    list1,
    constraints,
    list1Weight
  )
  let order = topoSort(mapSetArr, setInDegree, list1Weight)
  //
  list1.sort((a, b) => {
    const indexA = list1.indexOf(a)
    const indexB = list1.indexOf(b)
    return order.indexOf(indexA) - order.indexOf(indexB)
  })
  let allElementWeight = []
  let allElement = []
  list1.forEach(set => {
    set.forEach(id => {
      allElement.push(id)
      allElementWeight.push(getWeight(id, list2))
    })
  })
  let [mapElementArr, elementInDegree] = dealElementConstraints(
    list1,
    constraints,
    allElementWeight
  )
  let elementOrder = topoSort(mapElementArr, elementInDegree, allElementWeight)
  for (let arr of list1) {
    arr.sort((a, b) => {
      const indexA = allElement.indexOf(a)
      const indexB = allElement.indexOf(b)
      return elementOrder.indexOf(indexA) - elementOrder.indexOf(indexB)
    })
  }
  let ans = []
  list1.forEach(session => ans.push(...session))
  return ans
}

//---------------------part of toposort--------------
export function topoSort(mapSetArr, inDegree, listWeight) {
  let order = []
  for (let i = 0; i < inDegree.length; i++) {
    let minWeight = Number.MAX_SAFE_INTEGER
    let pos = -1
    for (let j = 0; j < inDegree.length; j++) {
      if (inDegree[j] == 0 && listWeight[j] < minWeight) {
        pos = j
        minWeight = listWeight[j]
      }
    }
    order.push(pos)
    inDegree[pos] = -1
    //has been added to the order array
    for (let i = 0; i < mapSetArr[pos].length; i++) {
      if (mapSetArr[pos][i] !== undefined) {
        inDegree[i] -= 1
      }
    }
  }
  return order
}

export function dealSetConstraints(list, constraints, listWeight) {
  let mapSetArr = []
  //transform constraint to edges in a graph
  let inDegree = []
  let setArr = new DisjointSet(list.length)
  //binding sets
  list.forEach(x => {
    mapSetArr.push([])
    inDegree.push(0)
  })
  for (let constraint of constraints) {
    let [first, second] = constraint
    let firstSetId = getSetId(first, list)
    let secondSetId = getSetId(second, list)
    if (firstSetId !== secondSetId) {
      setArr.union(firstSetId, secondSetId)
      let sumWeight = 0
      let allElement = setArr.allElementInSet(firstSetId)
      allElement.forEach(id => (sumWeight += listWeight[id]))
      for (let i = 0; i < allElement.length; i++) {
        listWeight[allElement[i]] = sumWeight / allElement.length
      }
      mapSetArr[firstSetId][secondSetId] = 1
      inDegree[secondSetId] += 1
    }
  }
  return [mapSetArr, inDegree]
}

export function getWeight(id, list2) {
  if (list2.indexOf(id) === -1) return 0
  return list2.indexOf(id)
}

export function getSetId(element, setArr) {
  for (let set of setArr) {
    if (set.indexOf(element) !== -1) {
      return setArr.indexOf(set)
    }
  }
  console.error("Can't find this element in any set!")
  return -1
}

export function dealElementConstraints(list, constraints, listWeight) {
  let listAllElement = []
  list.forEach(x => {
    listAllElement = [...listAllElement, ...x]
  })
  let mapElementArr = []
  let inDegree = []
  let setArr = new DisjointSet(listAllElement.length)

  listAllElement.forEach(x => {
    mapElementArr.push([])
    inDegree.push(0)
  })
  for (let constraint of constraints) {
    let [first, second] = constraint
    let firstSetId = getSetId(first, list)
    let secondSetId = getSetId(second, list)
    if (firstSetId === secondSetId) {
      setArr.union(
        listAllElement.indexOf(first),
        listAllElement.indexOf(second)
      )
      let allElement = setArr.allElementInSet(listAllElement.indexOf(first))
      let sumWeight = 0
      allElement.forEach(id => (sumWeight += listWeight[id]))
      for (let i = 0; i < allElement.length; i++) {
        listWeight[allElement[i]] = sumWeight / allElement.length
      }
      mapElementArr[listAllElement.indexOf(first)][
        listAllElement.indexOf(second)
      ] = 1
      inDegree[listAllElement.indexOf(second)] += 1
    }
  }
  return [mapElementArr, inDegree]
}
