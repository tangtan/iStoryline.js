import { logStoryInfo } from '../../src/js/utils/logger'
import { drawStorylinePath } from '../../src/js/utils/drawer'
import iStoryline from '../../src/js'

async function main(fileName) {
  const iStorylineInstance = new iStoryline()
  const fileUrl = `../../data/${fileName.split('.')[1]}/${fileName}`
  let graph = await iStorylineInstance.load(fileUrl)
  // Scale to window size
  const containerDom = document.getElementById('mySvg')
  const windowW = containerDom.clientWidth - 20
  const windowH = containerDom.clientHeight - 20
  graph = iStorylineInstance.scale(10, 10, windowW, windowH)
  logStoryInfo(iStorylineInstance._story)
  const storylinePaths = graph.storylinePaths
  storylinePaths.forEach(storylinePath => drawStorylinePath(storylinePath))
}

main('Redcap.json')
