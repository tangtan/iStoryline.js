import { StyleConfiger } from './styleConfiger'
import { LayoutRelaxer } from './layoutRelaxer'
import { Table } from '../data/table'
import { STYLE_LABELS, RENDER_MODE } from '../utils/CONSTANTS'
export class PathSmoother {
  constructor(story, constraints) {
    this.styleConfiger = new StyleConfiger(story, constraints)
    this.layoutRelaxer = new LayoutRelaxer(story, constraints)
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
          (curFlags[style.value(i, j)] & 1) ^ //curnum odd or even
            (moveMark[i][j] ? styleFlag[i][j] & 1 : 1) //curflag odd or even
            ? 1
            : -1,
          style.value(i, j)
        )
        curFlags[style.value(i, j)] += curFlag
        for (let z = 0; z < lineNodes.length; z++)
          pos[i][j].push([lineNodes[z][0], lineNodes[z][1]])
        if (j < m - 1) {
          if (!charater.value(i, j + 1)) continue
          const { gapANodes, gapBNodes } = this.linkGap(
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
            [style.value(i, j), style.value(i, j + 1)],
            [
              (curFlags[style.value(i, j)] & 1) ^
              (moveMark[i][j] ? styleFlag[i][j] & 1 : 1)
                ? 1
                : -1,
              (curFlags[style.value(i, j + 1)] & 1) ^
              (moveMark[i][j + 1] ? styleFlag[i][j + 1] & 1 : 1)
                ? 1
                : -1,
            ],
            curFlags
          )
          for (let k = 1; k < gapANodes.length; k++)
            pos[i][j].push([gapANodes[k][0], gapANodes[k][1]])
          for (let k = 0; k < gapBNodes.length - 1; k++)
            pos[i][j + 1].push([gapBNodes[k][0], gapBNodes[k][1]])
        }
      }
    }
    story.cleanPositions()
    for (let i = 0; i < pos.length; i++) {
      for (let j = 0; j < pos[i].length; j++) {
        if (charater.value(i, j)) tpos[i][j] = story.addPosition(pos[i][j])
      }
    }
    const position = new Table(tpos)
    return position
  }
  linkLine(nodes, flag, styleId) {
    if (STYLE_LABELS[styleId] === 'Zigzag')
      return this.zigzagLinker(nodes, flag)
    if (STYLE_LABELS[styleId] === 'Wave') return this.waveLinker(nodes, flag)
    if (STYLE_LABELS[styleId] === 'Bump') return this.bumpLinker(nodes, flag)
    if (STYLE_LABELS[styleId] === 'Twine') return this.twineLinker(nodes, flag)
    if (STYLE_LABELS[styleId] === 'Collide')
      return this.collideLinker(nodes, flag)
    if (RENDER_MODE === 'Smooth') return this.normalLinker(nodes, flag)
    else return this.sketchLinker(nodes, flag)
  }
  linkGap(nodes, styles, flags, curFlags) {
    let gapANodes = []
    let gapBNodes = []
    if (nodes[0][1] !== nodes[1][1]) {
      let tmpNodes = []
      if (RENDER_MODE === 'Smooth') tmpNodes = this.bezierLinker(nodes)
      else tmpNodes = this.sketchLinker(nodes).lineNodes
      for (let k = 0; k < tmpNodes.length; k++) {
        if (k <= tmpNodes.length >> 1)
          gapANodes.push([tmpNodes[k][0], tmpNodes[k][1]])
        if (k >= tmpNodes.length >> 1)
          gapBNodes.push([tmpNodes[k][0], tmpNodes[k][1]])
      }
    } else {
      const midNode = [(nodes[0][0] + nodes[1][0]) / 2, nodes[0][1]]
      const gapA = this.linkLine([nodes[0], midNode], flags[0], styles[0])
      curFlags[styles[0]] += gapA.curFlag
      const gapB = this.linkLine([midNode, nodes[1]], flags[1], styles[1])
      curFlags[styles[1]] += gapB.curFlag
      gapANodes = gapA.lineNodes
      gapBNodes = gapB.lineNodes
    }
    return { gapANodes, gapBNodes }
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
    if (SAMPLERATE < 2) SAMPLERATE = 2 //ensure that the number of nodes is odd
    if (SAMPLERATE & 1) SAMPLERATE += 1 //thus, we can divide nodes into two groups evenly
    for (let i = 0; i <= SAMPLERATE; i++) {
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
  sketchLinker(
    nodes,
    flag = 1,
    sampleling = 5,
    sketchN = 3,
    height = 0.03,
    length = 10,
    shakeX = 0.02,
    shakeY = 0.02
  ) {
    let lineNodes = [],
      endNodes = [],
      p = [],
      curFlag = 0
    let tmpLength = nodes[1][0] - nodes[0][0]
    let tmpHeight = nodes[1][1] - nodes[0][1]
    if (nodes[0][1] === nodes[1][1]) {
      lineNodes.push([nodes[0][0], nodes[0][1]])
      endNodes.push([nodes[0][0] + tmpLength / sampleling, nodes[0][1]])
      endNodes.push([nodes[1][0] - tmpLength / sampleling, nodes[1][1]])
      p.push(endNodes[0])
      p.push([
        (endNodes[0][0] * (sketchN - 1)) / sketchN + endNodes[1][0] / sketchN,
        endNodes[0][1] +
          (Math.random() > 0.5 ? -1 : 1) * Math.random() * tmpLength * height,
      ])
      p.push([
        endNodes[0][0] / sketchN + (endNodes[1][0] * (sketchN - 1)) / sketchN,
        endNodes[1][1] +
          (Math.random() > 0.5 ? -1 : 1) * Math.random() * tmpLength * height,
      ])
      p.push(endNodes[1])
      for (let i = 0, curFlag = 6; i <= curFlag; i++)
        lineNodes.push([
          this.calcBezier(p, i / curFlag, 0),
          this.calcBezier(p, i / curFlag, 1),
        ])
      lineNodes.push([nodes[1][0], nodes[1][1]])
    } else {
      let smoothNodes = this.bezierLinker(nodes)
      for (let i = 1; i < smoothNodes.length - 1; i++) {
        smoothNodes[i][0] +=
          (Math.random() > 0.5 ? -1 : 1) * Math.random() * tmpLength * shakeX
        smoothNodes[i][1] +=
          (Math.random() > 0.5 ? -1 : 1) * Math.random() * tmpHeight * shakeY
      }
      let ctrlNode = [
        smoothNodes[0][0] - (smoothNodes[1][0] - smoothNodes[0][0]) / 2,
        smoothNodes[0][1],
      ]
      for (let i = 0; i < smoothNodes.length - 1; i++) {
        ctrlNode[0] = 2 * smoothNodes[i][0] - ctrlNode[0]
        ctrlNode[1] = 2 * smoothNodes[i][1] - ctrlNode[1]
        p[0] = smoothNodes[i]
        p[1] = ctrlNode
        p[2] = ctrlNode
        p[3] = smoothNodes[i + 1]
        for (let j = 0, curFlag = 4; j < curFlag; j++)
          lineNodes.push([
            this.calcBezier(p, j / curFlag, 0),
            this.calcBezier(p, j / curFlag, 1),
          ])
      }
      lineNodes.push([
        smoothNodes[smoothNodes.length - 1][0],
        smoothNodes[smoothNodes.length - 1][1],
      ])
    }
    return { lineNodes, curFlag }
  }
  zigzagLinker(nodes, flag = 1, length = 10, height = 4) {
    let lineNodes = []

    const tmpLength = nodes[1][0] - nodes[0][0]
    let curFlag = Math.ceil(tmpLength / length)
    if (curFlag < 2) curFlag = 2
    if (curFlag & 1) curFlag += 1

    lineNodes.push([nodes[0][0], nodes[0][1]])
    for (let z = 0; z < curFlag; z++) {
      lineNodes.push([
        nodes[0][0] + length * (z + 0.5),
        nodes[0][1] + height * (z & 1 ? -1 : 1) * flag,
      ])
    }
    lineNodes.push([nodes[1][0], nodes[1][1]])

    return { lineNodes, curFlag }
  }
  waveLinker(nodes, flag = 1, length = 10, height = 4, sampleling = 2) {
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
  bumpLinker(nodes, flag = 1, length = 10, height = 4) {
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
  twineLinker(nodes, flag = 1, length = 15, height = 4, sampleling = 2) {
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
  collideLinker(nodes, flag = 1, length = 50, height = 2) {
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
}
