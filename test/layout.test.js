import axios from 'axios'
import { expect } from 'chai'
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
      it(`${storyId}: orderTable matching storyflow`, done => {
        axios
          .post(storyflowUrl, orderConfig)
          .then(res => {
            expect(res.data.data).to.have.property('perm')
            const baseOrder = res.data.data.perm
            const graph = iStoryliner.load(storyJson)
            const orderTable = graph.getTable('sort')
            compareTables(orderTable, baseOrder, done)
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
      it(`${storyId}: alignTable matching storyflow`, done => {
        axios
          .post(storyflowUrl, orderConfig)
          .then(res => {
            expect(res.data.data).to.have.property('align')
            const baseAlign = res.data.data.align
            const graph = iStoryliner.load(storyJson)
            const alignTable = graph.getTable('align')
            compareTables(alignTable, baseAlign, done)
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

function compareTables(table, arr, done) {
  for (let row = 0; row < table.rows; row++) {
    for (let col = 0; col < table.cols; col++) {
      const tableVal = table.value(row, col)
      const arrVal = arr[row][col]
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
