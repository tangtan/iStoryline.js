import { logStoryInfo } from '../../src/js/utils/logger'
import { drawInitial } from '../../src/js/utils/drawer'
import iStoryline from '../../src/js'

const filePath = '../../data/xml/'
const fileName = 'ChasingDragon.xml'

async function main() {
  const iStorylineInstance = new iStoryline()
  const fileUrl = filePath + fileName
  let graph = await iStorylineInstance.load(fileUrl)
  graph = iStorylineInstance.addCharacter('TT', [[1, 10]])
  graph = iStorylineInstance.addCharacter('TT2', [[1, 5], [7, 22]])
  graph = iStorylineInstance.addCharacter('TT3', [[7, 30], [65, 80]])
  graph = iStorylineInstance.deleteCharacter('TT2')
  graph = iStorylineInstance.changeCharacter('TT3', [[1, 5], [7, 22]])
  graph = iStorylineInstance.addSession([0, 1, 2, 3], [1, 9])
  iStorylineInstance.dump(fileName + '.json', 'json')
  logStoryInfo(iStorylineInstance._story)
  const paths = graph.storylines
  const path = graph.getTable('path')
  const character = graph.getTable('character')
  for (let i = 0, n = graph.getTableRows(); i < n; i++) {
    for (let j = 0, m = graph.getTableCols(); j < m; j++) {
      if (character.value(i, j)) drawInitial(paths[path.value(i, j)])
    }
  }
}

main()
