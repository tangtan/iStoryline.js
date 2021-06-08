import { logStoryInfo } from '../../src/js/utils/logger'
import { drawStoryline } from '../../src/js/utils/drawer'
import iStoryline from '../../src/js'

async function main(fileName) {
  const iStorylineInstance = new iStoryline()
  const fileUrl = `../../data/${fileName.split('.')[1]}/${fileName}`
  let graph = await iStorylineInstance.loadFile(fileUrl)
  // Scale to window size
  const containerDom = document.getElementById('mySvg')
  const windowW = containerDom.clientWidth - 20
  const windowH = containerDom.clientHeight - 20
  graph = iStorylineInstance.scale(10, 10, windowW * 0.8, windowH / 2)
  logStoryInfo(iStorylineInstance._story)
  const storylines = graph.storylines
  const characters = graph.characters
  storylines.forEach((storyline, idx) =>
    drawStoryline(characters[idx], storyline)
  )
}
main('Coco.json')

// function main2() {
//   const iStoryliner = new iStoryline()
//   // Scale to window size
//   const containerDom = document.getElementById('mySvg')
//   const windowW = containerDom.clientWidth - 20
//   const windowH = containerDom.clientHeight - 20
//   iStoryliner.addCharacter('tt', [[0, 10], [50, 60]])
//   graph = iStoryliner.scale(10, 10, windowW * 0.8, windowH / 2)
//   logStoryInfo(iStorylineInstance._story)
//   const storylines = graph.storylines
//   storylines.forEach(storyline => drawStoryline(storyline))
// }

// main2()
