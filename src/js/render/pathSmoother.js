import { StyleConfiger } from './styleConfiger'
import { LayoutRelaxer } from './layoutRelaxer'
import { Table } from '../data/table'
import { STYLE_LABELS } from '../utils/CONSTANTS'
export class PathSmoother {
  constructor(story, constraints) {
    this.styleConfiger = new StyleConfiger(story, constraints)
    this.layoutRelaxer = new LayoutRelaxer(story)
  }
  genStyle(story, constraints) {
    return this.styleConfiger.style
  }
  genPosition(story) {
    const layout = story.getTable('layout')
    const charater = story.getTable('character')
    const { style, styleFlag, moveMark, styleY } = this.styleConfiger
    const renderX = this.layoutRelaxer.renderX
    let pos = [],
      tpos = []
    for (let i = 0, n = story.getTableRows(); i < n; i++) {
      pos[i] = []
      tpos[i] = []
      for (let j = 0, m = story.getTableCols(); j < m; j++) {
        pos[i][j] = []
        tpos[i][j] = 0
      }
    }
    for (let i = 0, n = story.getTableRows(); i < n; i++) {
      let curFlags = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
      for (let j = 0, m = story.getTableCols(); j < m; j++) {
        if (!charater.value(i, j)) continue
        const { lineNodes, curFlag } = this.linkLine(
          [
            [
              renderX[i][j][0],
              moveMark[i][j] ? styleY[i][j] : layout.value(i, j),
            ],
            [
              renderX[i][j][1],
              moveMark[i][j] ? styleY[i][j] : layout.value(i, j),
            ],
          ],
          curFlags[style[i][j]] &
            1 &
            (moveMark[i][j] ? styleFlag[i][j] & 1 : 1),
          style[i][j]
        )
        curFlags[style[i][j]] += curFlag
        for (let z = 0; z < lineNodes.length; z++)
          pos[i][j].push([lineNodes[z][0], lineNodes[z][1]])

        if (j < m - 1) {
          if (!charater.value(i, j + 1)) continue
          const gapNodes = this.linkGap(
            [
              [
                renderX[i][j][1],
                moveMark[i][j] ? styleY[i][j] : layout.value(i, j),
              ],
              [
                renderX[i][j + 1][0],
                moveMark[i][j + 1] ? styleY[i][j + 1] : layout.value(i, j + 1),
              ],
            ],
            [styleY[i][j], styleY[i][j + 1]],
            [
              curFlags[styleY[i][j]] &
                1 &
                (moveMark[i][j] ? styleFlag[i][j] & 1 : 1),
              curFlags[styleY[i][j + 1]] &
                1 &
                (moveMark[i][j + 1] ? styleFlag[i][j + 1] & 1 : 1),
            ],
            curFlags
          )
          for (let k = 1; k < gapNodes.length - 1; k++) {
            if (k <= gapNodes.length >> 1)
              pos[i][j].push([gapNodes[k][0], gapNodes[k][1]])
            if (k >= gapNodes.length >> 1)
              pos[i][j + 1].push([gapNodes[k][0], gapNodes[k][1]])
          }
        }
      }
    }
    for (let i = 0; i < pos.length; i++) {
      for (let j = 0; j < pos[i].length; j++) {
        if (charater.value(i, j)) tpos[i][j] = story.addPosition(pos[i][j])
      }
    }
    const position = new Table(tpos)
    story.setTable('position', position)
    return position
  }
  getStyleId(styleName) {
    for (let i = 0; i < STYLE_LABELS.length; i++) {
      if (styleName === STYLE_LABELS[i]) return i
    }
    return 0
  }
  linkLine(nodes, flag, styleId) {
    if (STYLE_LABELS[styleId] === 'Zigzag')
      return this.zigzagLinker(nodes, flag)
    if (STYLE_LABELS[styleId] === 'Wave') return this.waveLinker(nodes, flag)
    if (STYLE_LABELS[styleId] === 'Bump') return this.bumpLinker(nodes, flag)
    if (STYLE_LABELS[styleId] === 'Twine') return this.twineLinker(nodes, flag)
    if (STYLE_LABELS[styleId] === 'Collide')
      return this.collideLinker(nodes, flag)
    return this.normalLinker(nodes, flag)
  }
  linkGap(nodes, styles, flags, curFlags) {
    let gapNodes = []
    if (nodes[0][1] !== nodes[1][1]) {
      gapNodes = this.bezierLinker(nodes)
    } else {
      const midNode = [(nodes[0][0] + nodes[1][0]) / 2, nodes[0][1]]
      const gapA = this.linkLine([nodes[0], midNode], flags[0], styles[0])
      curFlags[styles[0]] += gapA.curFlag
      const gapB = this.linkLine([midNode, nodes[1]], flags[1], styles[1])
      curFlags[styles[1]] += gapB.curFlag
      for (let i = 0; i < gapA.lineNodes.length - 1; i++)
        gapNodes.push(gapA.lineNodes[i])
      for (let i = 0; i < gapB.lineNodes.length; i++)
        gapNodes.push(gapB.lineNodes[i])
    }
    return gapNodes
  }
  bezierLinker(nodes, SAMPLERATE = 5) {
    let lineNodes = [],
      p = []
    if (nodes.length === 2) {
      p[0] = [nodes[0][0], nodes[0][1]]
      p[1] = [(nodes[0][0] + nodes[1][0]) * 0.5, nodes[0][1]]
      p[2] = [(nodes[0][0] + nodes[1][0]) * 0.5, nodes[1][1]]
      p[3] = [nodes[1][0], nodes[1][1]]
    } else {
      for (let i = 0; i < 4; i++) p[i] = [nodes[i][0], nodes[i][1]]
    }
    if (SAMPLERATE < 2) SAMPLERATE = 2
    if (SAMPLERATE & 1) SAMPLERATE += 1 //ensure that the number of nodes is odd
    for (let i = 0; i <= SAMPLERATE; i++) {
      //start and end nodes won't be included
      lineNodes[i] = []
      lineNodes[i][0] = this.calcBezier(p, i / SAMPLERATE, 0)
      lineNodes[i][1] = this.calcBezier(p, i / SAMPLERATE, 1)
    }
    return lineNodes
  }
  normalLinker(nodes, flag = 1) {
    const lineNodes = nodes
    let curFlag = 0
    return { lineNodes, curFlag }
  }
  zigzagLinker(nodes, flag = 1, length = 10, height = 25) {
    let lineNodes = []

    const tmpLength = nodes[0][0] - nodes[1][0]
    let curFlag = Math.ceil(tmpLength / length)
    if (curFlag < 2) curFlag = 2
    if (curFlag & 1) curFlag += 1

    lineNodes.push([nodes[0][0], nodes[0][1]])
    for (let z = 0; z < curFlag; z++) {
      lineNodes.push([
        nodes[0][0] + (tmpLength * (z + 0.5)) / curFlag,
        nodes[0][1] + height * (z & 1 ? -1 : 1) * flag,
      ])
    }
    lineNodes.push([nodes[1][0], nodes[1][1]])

    return { lineNodes, curFlag }
  }
  waveLinker(nodes, flag = 1, length = 10, height = 30, sampleling = 2) {
    let lineNodes = []

    const tmpLength = nodes[1][0] - nodes[0][0]
    let curFlag = Math.ceil(tmpLength / length)
    if (curFlag < 2) curFlag = 2
    if (curFlag & 1) curFlag += 1
    let sampleRate = Math.ceil(tmpLength / sampleling)
    if (sampleRate < 2) sampleRate = 2
    if (sampleRate & 1) sampleRate += 1

    for (let z = 0; z <= sampleRate; z++) {
      lineNodes.push([
        nodes[0][0] + (tmpLength * z) / sampleRate,
        nodes[0][1] +
          Math.sin((z * curFlag * 3.14) / sampleRate) * height * flag,
      ])
    }
    return { lineNodes, curFlag }
  }
  bumpLinker(nodes, flag = 1, length = 10, height = 25) {
    let lineNodes = []

    const tmpLength = nodes[1][0] - nodes[0][0]
    let curFlag = Math.ceil(tmpLength / length)
    if (curFlag < 2) curFlag = 2
    if (curFlag & 1) curFlag += 1

    for (let z = 0; z <= curFlag; z++) {
      lineNodes.push([
        nodes[0][0] + (tmpLength * z) / curFlag,
        nodes[0][1] + height * (z & 1 ? 1 : -1) * flag * (z != 0),
      ])
      lineNodes.push([
        nodes[0][0] + (tmpLength * z) / curFlag,
        nodes[0][1] + height * (z & 1 ? -1 : 1) * flag * (z != curFlag),
      ])
    }

    return { lineNodes, curFlag }
  }
  twineLinker(nodes, flag = 1, length = 15, height = 50, sampleling = 2) {
    let lineNodes = []

    const tmpLength = nodes[1][0] - nodes[0][0]
    let curFlag = Math.ceil(tmpLength / length)
    if (curFlag < 2) curFlag = 2
    if (curFlag & 1) curFlag += 1
    let sampleRate = Math.ceil(tmpLength / sampleling)
    if (sampleRate < 2) sampleRate = 2
    if (sampleRate & 1) sampleRate += 1

    for (let z = 0; z <= sampleRate; i++) {
      lineNodes.push([
        nodes[0][0] + (tmpLength * z) / sampleRate,
        nodes[0][1] +
          Math.sin((z * curFlag * 3.14) / sampleRate) * height * flag,
      ])
    }

    return { lineNodes, curFlag }
  }
  collideLinker(nodes, flag = 1, length = 50, height = 15) {
    let lineNodes = []
    const curFlag = 0
    lineNodes.push([nodes[0][0], nodes[0][1] + flag * height])
    lineNodes.push([nodes[1][0], nodes[1][1] + flag * height])

    return { lineNodes, curFlag }
  }
  calcBezier(p, t, d) {
    let ret = p[0][d] * (1 - t) * (1 - t) * (1 - t)
    ret += 3 * p[1][d] * t * (1 - t) * (1 - t)
    ret += 3 * p[2][d] * t * t * (1 - t)
    ret += p[3][d] * t * t * t
    return ret
  }
  newArray(n, m) {
    let ret = []
    for (let i = 0; i < n; i++) {
      ret[i] = []
      for (let j = 0; j < m; j++) ret[i][j] = 0
    }
  }
}
