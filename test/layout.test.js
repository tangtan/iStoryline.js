import axios from 'axios'
import { expect } from 'chai'
import { Table } from '../src/js/data/table'
import iStoryline from '../src/js/index'
import busanStoryJson from '../data/json/TrainToBusan.json'
import cocoStoryJson from '../data/json/Coco.json'
import jurassicparkStoryJson from '../data/json/JurassicParkTune.json'

describe('Layout', () => {
  const storyflowUrl = 'http://localhost:5050/api/update'
  const storyScripts = ['Busan.xml', 'Coco.xml', 'JurassicParkTune.xml']

  describe('order', () => {
    storyScripts.forEach(storyId => {
      const orderConfig = generatePostConfig(storyId)
      const storyJson = generateStoryJson(storyId)
      const iStoryliner = new iStoryline()
      it(`${storyId}: iStoryline performs better in ORDERING`, done => {
        axios
          .post(storyflowUrl, orderConfig)
          .then(res => {
            expect(res.data.data).to.have.property('perm')
            const baseTable = generateBaseTable(res.data.data.perm)
            const graph = iStoryliner.load(storyJson)
            const orderTable = graph.getTable('sort')
            // compareTables(orderTable, baseOrder, done)
            compareCrossings(baseTable, orderTable, done)
          })
          .catch(err => done(err))
      })
    })
  })

  describe('align', () => {
    storyScripts.forEach(storyId => {
      const orderConfig = generatePostConfig(storyId)
      const storyJson = generateStoryJson(storyId)
      const iStoryliner = new iStoryline()
      it(`${storyId}: iStoryline performs better in ALIGNMENT`, done => {
        axios
          .post(storyflowUrl, orderConfig)
          .then(res => {
            expect(res.data.data).to.have.property('align')
            const baseTable = generateBaseTable(res.data.data.align)
            const graph = iStoryliner.load(storyJson)
            const alignTable = graph.getTable('align')
            compareWiggles(baseTable, alignTable, done)
          })
          .catch(err => done(err))
      })
    })
  })
})

function generateStoryJson(storyId) {
  switch (storyId) {
    case 'Busan.xml':
      return busanStoryJson
    case 'Coco.xml':
      return cocoStoryJson
    case 'JurassicParkTune.xml':
      return jurassicparkStoryJson
    default:
      return busanStoryJson
  }
}

function generatePostConfig(storyId) {
  return {
    id: storyId,
    sessionInnerGap: 18, // inner gap of the sessions
    sessionOuterGap: 54, // outer gap between sessions
    sessionInnerGaps: [],
    sessionOuterGaps: [],
    majorCharacters: [],
    orders: [],
    groupIds: [],
    selectedSessions: [],
    orderTable: [],
    sessionBreaks: [],
  }
}

function generateBaseTable(arr) {
  for (let row = 0; row < arr.rows; row++) {
    for (let col = 0; col < arr.cols; col++) {
      const tableVal = arr[row][col]
      if (tableVal === -1) {
        arr[row][col] = 0 // Storyflow中-1是无效值，而iStoryline中0是无效值，这里做个统一
      }
    }
  }
  return new Table(arr)
}

/**
 * Compare table cells one by one.
 * @param {Table} table1 baseline method
 * @param {Table} table2 testing method
 */
function compareTables(table1, table2, done) {
  for (let row = 0; row < table1.rows; row++) {
    for (let col = 0; col < table1.cols; col++) {
      const tableVal = table1.value(row, col)
      const arrVal = table2.value(row, col)
      if (tableVal > 0 && arrVal > -1) {
        if (tableVal !== arrVal) {
          done(`${row}: ${col} mismatching`)
          return false
        }
      }
    }
  }
  done()
  return true
}

/**
 * Compare crossings
 * @param {Table} table1 baseline method
 * @param {Table} table2 testing method
 */
function compareCrossings(table1, table2, done) {
  const crossing1 = countCrossings(table1)
  const crossing2 = countCrossings(table2)
  if (crossing2 > crossing1) {
    done(`Storyflow performs better in ORDERING: ${crossing1} < ${crossing2}`)
  } else {
    done()
  }
}

function countCrossings(table) {
  let count = 0
  for (let frame = 0; frame < table.cols - 2; frame++) {
    const left = frame
    const right = frame + 1
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

/**
 * Compare alignment
 * @param {Table} table1 baseline method
 * @param {Table} table2 testing method
 */
function compareWiggles(table1, table2, done) {
  const wiggle1 = countWiggles(table1)
  const wiggle2 = countWiggles(table2)
  if (wiggle2 > wiggle1) {
    done(`Storyflow performs better in ALIGNMENT: ${wiggle1} < ${wiggle2}`)
  } else {
    done()
  }
}

function countWiggles(table) {
  let count = 0
  for (let char = 0; char < table.rows; char++) {
    for (let frame = 0; frame < table.cols - 1; frame++) {
      if (table.value(char, frame) * table.value(char, frame + 1) > 0) {
        if (table.value(char, frame) !== table.value(char, frame + 1)) {
          count++
        }
      }
    }
  }
}
