/**
 * @param {Story} story
 * @param {constraints} Object
 */

import { thomsonCrossSectionDependencies } from 'mathjs'

export function greedyAlign(story, constraints) {
  debugger
  console.log(story)
  const param = getParam(story, constraints)
  const alignTable = runAlgorithms(param)
  story.setTable('align', alignTable)
}

function getParam(story, constraints) {}

/**
 * @param {Number[]} list1
 * @param {Number[]} list2
 * @param {Number[][]} reward
 * @return {Number[]} longestCommonSubstring  list1中元素对齐的是第几个list2中元素
 * @example     let list1Length=4;
 *              let list2Length=3
 *              let reward=[[1,1,1],[1,1,1],[1,1,1],[1,1,1]]
 */

export function longestCommonSubstring(list1Length, list2Length, reward) {
  let totalReward = []
  let direction = []
  reward.forEach(row => {
    totalReward.push([])
    direction.push([])
  })
  for (let i = 0; i < list1Length; i++) {
    reward[i][-1] = 0
  }
  for (let j = 0; j < list2Length; j++) {
    reward[-1][j] = 0
  }
  for (let i = 0; i < list1Length; i++) {
    for (let j = 0; j < list2Length; j++) {
      //edge condition
      let valueList = [
        totalReward[i - 1][j],
        totalReward[i][j - 1],
        totalReward[i - 1][j - 1] + reward[i][j],
      ] //0:left,1:right,2:align
      let maxListArg = maxArg(valueList)
      direction[i][j] = maxListArg
    }
  }
  let alignList = []
  let leftHead = list1Length
  let rightHead = list2Length
  while (rightHead >= 0 && leftHead >= 0) {
    if (direction[i][j] == 2) {
      alignList[leftHead] = rightHead
      leftHead -= 1
      rightHead -= 1
    } else if (direction[i][j] == 1) {
      rightHead -= 1
    } else if (direction[i][j] == 0) {
      leftHead -= 1
    } else {
      break
    }
  }
  return
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
