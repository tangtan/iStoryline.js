import { Table } from '../data/table'
import { DISTANCE_IN, DISTANCE_OUT } from '../utils/CONSTANTS'
import { number } from 'mathjs'

export function greedySlotCompact(story, constraints) {
  const param = getParam(story, constraints)
  const layoutTable = runAlgorithms(param)
  story.setTable('layout', layoutTable)
}

function getParam(story, constraints) {
  let alignTable = story.getTable('align')
  let sessionTable = story.getTable('session')
  let sortTable = story.getTable('sort')
  let height = sessionTable.rows
  let width = sessionTable.cols
  let characterIdInOrder = []

  let sessionInOrder = []
  let sessionAlignMaps = []
  for (let time = 0; time < width; time++) {
    let num = []
    for (let id = 0; id < height; id++) {
      if (sortTable.value(id, time) !== 0) num.push(id)
    }
    num.sort((a, b) => {
      return sortTable.value(a, time) - sortTable.value(b, time)
    })
    characterIdInOrder.push(num)
    let sessionInOrderSet = new Set()
    for (let cha of num) sessionInOrderSet.add(sessionTable.value(cha, time))
    sessionInOrder.push(Array.from(sessionInOrderSet))
    if (time == width - 1) continue // next, we deal with align
    let sessionAlignMap = new Map()
    let beAlignedSession = new Map() //sessionId 2 size, however don't use size now
    for (let characterId of num) {
      //num:characterIdInOrderInThisTime
      const sessionId = sessionTable.value(characterId, time)
      const alignCharacterId = alignTable.value(characterId, time)
      let alignSessionId = -1
      if (alignCharacterId !== -1)
        alignSessionId = sessionTable.value(alignCharacterId, time + 1)
      if (alignSessionId === 0) alignSessionId = -1
      //bug

      if (
        !sessionAlignMap.has(sessionId) ||
        sessionAlignMap.get(sessionId) === -1
      ) {
        if (beAlignedSession.has(alignSessionId)) alignSessionId = -1
        sessionAlignMap.set(sessionId, alignSessionId)
        beAlignedSession.set(alignSessionId, true)
      }
    }
    sessionAlignMaps.push(sessionAlignMap)
  }

  return {
    alignTable,
    sessionTable,
    sortTable,
    height,
    width,
    characterIdInOrder,
    sessionAlignMaps,
    sessionInOrder,
  }
}

/**
 * @param {Number[][]} characterIdInOrder
 * @param {Table} sessionTable
 * @param {Number} time
 * @param {Number} sessionId
 * @returns {Number[]}
 */
function sessionId2CharactersInOrder(
  characterIdInOrder,
  sessionTable,
  time,
  sessionId
) {
  let characterIdInOrderInThisTime = characterIdInOrder[time]
  let ans = []
  for (let characterId of characterIdInOrderInThisTime) {
    if (sessionTable.value(characterId, time) === sessionId)
      ans.push(characterId)
  }
  return ans
}

function calculateSlotHeight(slots, slotId, characterIdInOrder, sessionTable) {
  let sum = 0
  for (let i = 0; i < slotId; i++) {
    let slot = slots[i]
    let maxCharacterNum = 0
    for (let time = 0; time < slot.length; time++) {
      let characters = sessionId2CharactersInOrder(
        characterIdInOrder,
        sessionTable,
        time,
        slot[time]
      )
      maxCharacterNum = Math.max(maxCharacterNum, characters.length)
    }
    sum += (maxCharacterNum - 1) * DISTANCE_IN + DISTANCE_OUT
  }
  return sum
}

function insert2Array(pos, array, element) {
  array.splice(pos, 0, element)
}

function sessionIdTime2SlotId(slots, sessionId, time) {
  for (let i = 0; i < slots.length; i++) {
    if (slots[i][time] === sessionId) return i
  }
  return -1
}

function runAlgorithms(param) {
  let {
    sessionTable,
    sortTable,
    alignTable,
    height,
    width,
    characterIdInOrder,
    sessionInOrder,
    sessionAlignMaps,
  } = param
  let ans = new Table()
  ans.resize(height, width, -1)
  let slots = []
  sessionInOrder[0].forEach(sessionId => {
    slots.push([sessionId])
  })
  // Init slots
  // Insert session to slot
  for (let time = 1; time < width; time++) {
    let sessionIdHasDealedMap = new Map()
    for (let slotId = 0; slotId < slots.length; slotId++) {
      let slot = slots[slotId]
      const lastTimeSessionId = slot[time - 1]
      if (!sessionAlignMaps[time - 1].has(lastTimeSessionId)) {
        slot.push(-1)
        continue
      }
      const thisTimeSessionId = sessionAlignMaps[time - 1].get(
        lastTimeSessionId
      )
      // if (thisTimeSessionId===0) debugger
      slot.push(thisTimeSessionId)
      sessionIdHasDealedMap.set(thisTimeSessionId, slotId)
    }
    //deal with new session
    let sessionIds = sessionInOrder[time]
    //is the first session aligned?
    if (!sessionIdHasDealedMap.has(sessionIds[0])) {
      let slot = new Array(time).fill(-1) //0-time-1
      slot.push(sessionIds[0])
      insert2Array(0, slots, slot)
      sessionIdHasDealedMap.set(sessionIds[0], 0)
    }
    for (
      let sessionIdNum = 1;
      sessionIdNum < sessionIds.length;
      sessionIdNum++
    ) {
      const sessionId = sessionIds[sessionIdNum]
      if (sessionIdHasDealedMap.has(sessionId)) continue
      //get last slot ID
      const lastSessionId = sessionIds[sessionIdNum - 1]
      const lastSlotId = sessionIdTime2SlotId(slots, lastSessionId, time)
      let slot = new Array(time).fill(-1) //0-time-1
      slot.push(sessionId)
      insert2Array(lastSlotId + 1, slots, slot)
    }
  }
  let slotsOfCharacter = new Array(slots.length)
  for (let i = 0; i < slotsOfCharacter.length; i++) slotsOfCharacter[i] = []
  for (let slotsId = 0; slotsId < slots.length; slotsId++)
    for (let time = 0; time < width; time++) {
      if (slots[slotsId][time] === -1) continue
      slotsOfCharacter[slotsId][time] = sessionId2CharactersInOrder(
        characterIdInOrder,
        sessionTable,
        time,
        slots[slotsId][time]
      )
    }
  //TODO align character
  let baseHeightArray = new Array(slots.length)
  for (
    let slotsOfCharacterId = 0;
    slotsOfCharacterId < slotsOfCharacter.length;
    slotsOfCharacterId++
  )
    for (let time = 0; time < width; time++) {
      if (!baseHeightArray[slotsOfCharacterId])
        baseHeightArray[slotsOfCharacterId] = calculateSlotHeight(
          slots,
          slotsOfCharacterId,
          characterIdInOrder,
          sessionTable
        )
      let baseHeight = baseHeightArray[slotsOfCharacterId]
      let charactersInThisSlot = slotsOfCharacter[slotsOfCharacterId][time]
      if (!charactersInThisSlot) continue
      for (
        let characterI = 0;
        characterI < charactersInThisSlot.length;
        characterI++
      ) {
        const characterId = charactersInThisSlot[characterI]
        const Height = baseHeight + characterI * DISTANCE_IN
        ans.replace(characterId, time, Height)
      }
    }
  // debugger

  // for (let time = 0; time < width; time++) {
  //   for (let id = 0; id < height; id++) {
  //     if (sortTable.value(id, time) !== 0)
  //       ans.replace(id, time, sortTable.value(id, time) * DISTANCE_OUT)
  //   }
  // }
  //console.log(ans)
  return ans
}
