import { Story } from '../../src/js/data/story'
import iStoryline from '../../src/js'
import { or } from 'mathjs'
import Snap from 'snapsvg'
import { greedySort } from '../../src/js/order/greedySort'
import { greedyAlign } from '../../src/js/align/greedyAlign'
import { greedySlotCompact } from '../../src/js/compact/greedySlotCompact'
import { smoothRender } from '../../src/js/render/smoothRender'
import { freeTransform } from '../../src/js/transform/freeTransform'

const fileUrl = '../../data/json/Redcap.json'

async function main() {
  let story = new Story()
  await story.load(fileUrl, 'json')
  story.addCharacter('TT', [[1, 10]])
  story.addCharacter('TT2', [[1, 5], [7, 22]])
  story.addCharacter('TT3', [[7, 30], [65, 80]])
  // story.deleteCharacter('TT3')
  story.changeCharacter('TT3', [[1, 5], [7, 22]])
  const newSessionID = story.getNewSessionID()
  story.changeSession(newSessionID, [0, 1], [3, 9])
  // story.changeLocation('ZJU', [1]);
  // story.changeLocation('HZ', [2, 3]);
  story.addTimeStamp(15)
  window.story = story
  const rows = story.getTableRows()
  const cols = story.getTableCols()
  const timeStamps = story.timeline
  const charaTable = story.getTable('character')
  const locationTable = story.getTable('location')
  const sessionTable = story.getTable('session')
  console.log(story)
  console.log(`Story Size: ${rows}x${cols}`)
  console.log(`Story Timeline: ${timeStamps}`)
  console.log(
    `Character Table ${charaTable.rows}x${charaTable.cols}: ${charaTable.mat}`
  )
  console.log(
    `Location Table ${locationTable.rows}x${locationTable.cols}: ${locationTable.mat}`
  )
  console.log(
    `Session Table ${sessionTable.rows}x${sessionTable.cols}: ${sessionTable.mat}`
  )
  // story.dump('test', 'xml')
  greedySort(story, [{}])
  greedyAlign(story, [])
  greedySlotCompact(story, [])
  smoothRender(story, [{}])
  const path = freeTransform(story, [])
  const paths = story.paths
  const character = story.getTable('character')
  for (let i = 0, n = story.getTableRows(); i < n; i++) {
    for (let j = 0, m = story.getTableCols(); j < m; j++) {
      if (character.value(i, j)) drawInitial(paths[path.value(i, j)])
    }
  }
}
function drawInitial(pathStr) {
  const svg = Snap('#mySvg')
  const pathSvg = svg.path(pathStr)
  pathSvg.hover(
    () => {
      pathSvg.attr({
        stroke: 'blue',
        'stroke-width': 4,
      })
    },
    () => {
      pathSvg.attr({
        stroke: 'black',
        'stroke-width': 1,
      })
    }
  )
  pathSvg.attr({
    fill: 'none',
    stroke: 'black',
    'stroke-width': 1,
  })
}
main()
