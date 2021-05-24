import { Table } from '../data/table'
import { ALPHA } from '../utils/CONSTANTS'

/**
 * @param {Story} story
 * @param {constraints} Object
 */
export function greedyAlign(story, constraints) {
  const params = getParams(story, constraints)
  const alignTable = runAlgorithm(params)
  story.setTable('align', alignTable)
}

function getParams(story, constraints) {
  let sortTable = story.getTable('sort')
  let chaTable = story.getTable('character')
  let sessionTable = story.getTable('session')
  let height = sortTable.rows
  let width = sortTable.cols
  let characterIdInOrder = []
  // debugger
  let constraintsAlign = constraints.filter(constraint => {
    return constraint.style === 'Straighten'
  })
  let constraintsBend = constraints.filter(
    constraint => constraint.style == 'Bend'
  )
  for (let time = 0; time < width; time++) {
    let num = []
    for (let id = 0; id < height; id++) {
      if (sortTable.value(id, time) !== 0) num.push(id)
    }
    num.sort((a, b) => {
      return sortTable.value(a, time) - sortTable.value(b, time)
    })
    characterIdInOrder.push(num)
  }
  let rewardArr = []
  for (let time = 0; time < width - 1; time++) {
    let reward = []
    for (let cha = 0; cha < characterIdInOrder[time].length; cha++) {
      let rewardInEachCha = []
      for (
        let chaInNextTime = 0;
        chaInNextTime < characterIdInOrder[time + 1].length;
        chaInNextTime++
      ) {
        const id1 = characterIdInOrder[time][cha]
        const id2 = characterIdInOrder[time + 1][chaInNextTime]
        let isConstraint = 0
        for (let constraint of constraintsAlign) {
          if (
            story.getCharacterID(constraint.names[0]) === id1 &&
            story.getCharacterID(constraint.names[0]) === id2 &&
            constraint.timeSpan[0] <= time &&
            constraint.timeSpan[1] >= time
          )
            isConstraint = 1
        }
        for (let constraint of constraintsBend) {
          if (
            story.getCharacterID(constraint.names[0]) === id1 &&
            story.getCharacterID(constraint.names[0]) === id2 &&
            constraint.timeSpan[0] <= time &&
            constraint.timeSpan[1] >= time
          )
            isConstraint = 2
        }
        if (isConstraint == 1) rewardInEachCha.push(Number.MAX_SAFE_INTEGER)
        else if (isConstraint == 2)
          rewardInEachCha.push(-Number.MAX_SAFE_INTEGER)
        else
          rewardInEachCha.push(
            solveReward(id1, id2, time, sessionTable, sortTable)
          )
      }
      reward.push(rewardInEachCha)
    }
    rewardArr.push(reward)
  }
  return {
    characterIdInOrder,
    rewardArr,
    width,
    height,
    chaTable,
  }
}

function runAlgorithm(param) {
  let ans = new Table(-1)
  let { height, width, rewardArr, characterIdInOrder } = param
  ans.resize(height, width, -1)
  for (let time = 0; time < width - 1; time++) {
    let alignAns
    alignAns = longestCommonSubstring(
      characterIdInOrder[time].length,
      characterIdInOrder[time + 1].length,
      rewardArr[time]
    )
    for (let idOrder = 0; idOrder < alignAns.length; idOrder++) {
      let alignId = alignAns[idOrder]
      if (alignAns[idOrder] === undefined) alignId = -1
      else alignId = characterIdInOrder[time + 1][alignId]

      ans.replace(characterIdInOrder[time][idOrder], time, alignId)
    }
  }
  return ans
}

/**
 * Calculate dynamic programming rewards
 * @param {Number} id1 first character ID
 * @param {Number} id2 second character ID
 * @param {Number} time first time
 * @param {Table} sessionTable sessionTable
 * @param {Table} sortTable sortTable
 * @returns {Number} reward
 */
function solveReward(id1, id2, time, sessionTable, sortTable) {
  let reward = 0
  let sessionId1 = sessionTable.value(id1, time)
  let sessionId2 = sessionTable.value(id2, time + 1)
  let session1 = findChaInSessionAtTime(
    sessionId1,
    time,
    sessionTable,
    sortTable
  )
  let session2 = findChaInSessionAtTime(
    sessionId2,
    time + 1,
    sessionTable,
    sortTable
  )
  for (let chaId of session1) {
    if (session2.indexOf(chaId) !== -1) reward += 1
  }
  reward +=
    ALPHA *
    (1 -
      Math.abs(
        session1.indexOf(id1) / session1.length -
          session2.indexOf(id2) / session2.length
      ))
  return reward
}

function findChaInSessionAtTime(sessionId, time, sessionTable, sortTable) {
  let ans = []
  let height = sessionTable.rows
  for (let id = 0; id < height; id++)
    if (sessionTable.value(id, time) === sessionId) ans.push(id)
  ans.sort((a, b) => {
    return sortTable.value(a, time) - sortTable.value(b, time)
  })
  return ans
}

/**
 * Calculate LCS from two sequences
 * @param {Number[]} list1
 * @param {Number[]} list2
 * @param {Number[][]} reward
 * @return {Number[]} longestCommonSubstring  list1中元素对齐的是第几个list2中元素
 * @example
 * let list1Length=4;
 * let list2Length=3
 * let reward=[[1,1,1],[1,1,1],[1,1,1],[1,1,1]]
 */

export function longestCommonSubstring(list1Length, list2Length, reward) {
  let totalReward = []
  let direction = []
  reward.forEach(row => {
    totalReward.push([])
    direction.push([])
  })
  // Init
  for (let i = 0; i < list1Length; i++) {
    reward[i][-1] = 0
  }
  reward[-1] = []
  totalReward[-1] = []
  for (let j = 0; j < list2Length; j++) {
    reward[-1][j] = 0
  }
  for (let i = -1; i < list1Length; i++)
    for (let j = -1; j < list2Length; j++) {
      totalReward[i][j] = 0
    }
  // Transition functions
  for (let i = 0; i < list1Length; i++) {
    for (let j = 0; j < list2Length; j++) {
      // Boundary conditions
      let valueList = [
        totalReward[i - 1][j],
        totalReward[i][j - 1],
        totalReward[i - 1][j - 1] + reward[i][j],
      ] // 0:left, 1:right, 2:align
      let maxListArg = maxArg(valueList)
      direction[i][j] = maxListArg
      totalReward[i][j] = valueList[maxListArg]
    }
  }
  let alignList = []
  let leftHead = list1Length - 1
  let rightHead = list2Length - 1
  while (rightHead >= 0 && leftHead >= 0) {
    if (direction[leftHead][rightHead] == 2) {
      alignList[leftHead] = rightHead
      leftHead -= 1
      rightHead -= 1
    } else if (direction[leftHead][rightHead] == 1) {
      rightHead -= 1
    } else if (direction[leftHead][rightHead] == 0) {
      leftHead -= 1
    } else {
      break
    }
  }
  return alignList
}

function maxArg(list) {
  let ans = -1
  let maxValue = Number.MIN_SAFE_INTEGER
  for (let i = 0; i < list.length; i++) {
    if (list[i] > maxValue) {
      maxValue = list[i]
      ans = i
    }
  }
  return ans
}
