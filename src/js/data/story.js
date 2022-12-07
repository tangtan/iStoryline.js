import * as d3Fetch from 'd3-fetch'
import { Table } from './table'
import {
  parseXMLFile,
  parseJSONFile,
  dumpXMLFile,
  dumpJSONFile,
  generateJSONFile,
} from '../utils/io'

export class Story {
  constructor() {
    this.restore()
  }

  /**
   * init story
   */
  restore() {
    this._maxSessionID = -1
    this._tableMap = new Map()
    this._tableMap.set('character', new Table())
    this._tableMap.set('session', new Table())
    this._tableMap.set('location', new Table())
    this._characters = []
    this._locations = []
    this._timeStamps = []
    this._timeStamps2X = []
    this._positions = []
    this._paths = []
  }

  get characters() {
    return this._characters
  }

  get locations() {
    return this._locations
  }

  get timeline() {
    return this._timeStamps
  }

  get positions() {
    return this._positions
  }

  get paths() {
    return this._paths
  }

  // /**
  //  * read xml/json document
  //  * @param {string} fileUrl
  //  * @param {string} fileType
  //  * @returns
  //  */
  // async loadFile(fileUrl) {
  //   const fileSeps = fileUrl.split('.')
  //   const fileType = fileSeps[fileSeps.length - 1]
  //   if (fileType === 'xml') {
  //     const xml = await d3Fetch.xml(fileUrl)
  //     parseXMLFile(xml, this)
  //   } else if (fileType === 'json') {
  //     const json = await d3Fetch.json(fileUrl)
  //     parseJSONFile(json, this)
  //   } else {
  //     console.error('Wrong fileType!')
  //   }
  // }

  /**
   * load json object
   * @param {Object} json
   * @returns
   */
  loadJson(json) {
    parseJSONFile(json, this)
  }

  /**
   * export xml/json document
   * @param {string} fileUrl
   * @param {string} fileType
   * @returns
   */
  dump(fileName, fileType) {
    if (fileType === 'xml') {
      dumpXMLFile(fileName, this)
    } else if (fileType === 'json') {
      dumpJSONFile(fileName, this)
    } else {
      console.error('Wrong fileType!')
    }
  }

  /**
   * get table (tableMap)
   * @param {string} tableName
   * @returns
   * - table: Table
   */
  getTable(tableName) {
    return this._tableMap.get(tableName)
  }

  /**
   * set table (tableMap)
   * @param {String} tableName
   * @param {Table} table
   */
  setTable(tableName, table) {
    this._tableMap.set(tableName, table)
  }

  getTableRows() {
    return this._characters.length || 0
  }

  getTableCols() {
    return this._timeStamps.length - 1 || 0
  }

  /**
   * change timeStamp to timeStep
   * @param {Number} timeStamp
   * @returns
   * - timeStep: number
   */
  getTimeStep(timeStamp) {
    const len = this.getTableCols()
    if (len === 0 || timeStamp < this._timeStamps[0]) return null
    for (let i = 0; i < len; i++) {
      if (this._timeStamps[i] >= timeStamp) {
        return i
      }
    }
    return timeStamp <= this._timeStamps[len] ? len : null
  }

  /**
   * change timeRange to timeSteps
   * @param {timeSpan[]} timeRange
   * @returns
   * - timeSteps: number[]
   */
  getTimeSteps(timeRange) {
    let tmpTimeSteps = [],
      timeSteps = []
    timeRange.forEach(timeSpan => {
      let l = -1,
        r = -1
      for (let i = 0; i < this.getTableCols(); i++) {
        if (
          this._timeStamps[i] <= timeSpan[0] &&
          timeSpan[0] < this._timeStamps[i + 1]
        )
          l = i
        if (
          this._timeStamps[i] < timeSpan[1] &&
          timeSpan[1] <= this._timeStamps[i + 1]
        )
          r = i
      }
      for (let i = l; i <= r; i++) tmpTimeSteps.push(i)
    })
    tmpTimeSteps.sort()
    if (tmpTimeSteps.length >= 1) timeSteps.push(tmpTimeSteps[0])
    for (let i = 1; i < tmpTimeSteps.length; i++) {
      if (tmpTimeSteps[i] !== timeSteps[timeSteps.length - 1]) {
        timeSteps.push(tmpTimeSteps[i])
      }
    }
    return timeSteps
  }

  /**
   * add timestamp to timestamps
   * @param {Number} timeStamp
   */
  addTimeStamp(timeStamp) {
    const storyJson = generateJSONFile(this)
    const characters = storyJson.Story.Characters
    const maxTimeStamp = Math.max(...this._timeStamps)
    if (timeStamp < maxTimeStamp) {
      for (let name in characters) {
        const character = characters[name]
        const _character = []
        character.forEach(_ => {
          const start = _['Start']
          const end = _['End']
          const sessionID = _['Session']
          if (timeStamp > start && timeStamp < end) {
            _character.push(
              {
                Start: start,
                End: timeStamp,
                Session: sessionID,
              },
              {
                Start: timeStamp,
                End: end,
                Session: sessionID,
              }
            )
          } else {
            _character.push(_)
          }
        })
        characters[name] = _character
      }
    } else if (timeStamp > maxTimeStamp) {
      for (let character of characters) {
        character.push({
          Start: maxTimeStamp,
          End: timeStamp,
          Session: this.getNewSessionID(),
        })
      }
    }
    parseJSONFile(storyJson, this)
  }

  /**
   * delete timestamp from timestamps
   * @param {Number} timeStamp
   */
  deleteTimeStamp(timeStamp) {}

  /**
   * add characters to the story
   * @param {String} characterName
   * @param {timeSpan[]} timeRange
   */
  addCharacter(characterName, timeRange = []) {
    if (this._characters.indexOf(characterName) > -1) {
      this.changeCharacter(characterName, timeRange)
    } else {
      const storyJson = generateJSONFile(this)
      const sessionID = ++this._maxSessionID
      const locations = storyJson.Story.Locations
      const characters = storyJson.Story.Characters
      if (locations.All) {
        locations.All.push(sessionID)
      } else {
        locations['All'] = [sessionID]
      }
      characters[characterName] = timeRange.map(timeSpan => {
        return {
          Start: timeSpan[0],
          End: timeSpan[1],
          Session: sessionID,
        }
      })
      parseJSONFile(storyJson, this)
    }
  }

  /**
   * delete characters from the story
   * @param {String | Number} character
   */
  deleteCharacter(character) {
    const characterName =
      typeof character === 'number'
        ? this.getCharacterName(character)
        : character
    if (characterName) {
      const storyJson = generateJSONFile(this)
      const locations = storyJson.Story.Locations
      const characters = storyJson.Story.Characters
      if (characters.hasOwnProperty(characterName)) {
        const sessions = characters[characterName].map(span => span['Session'])
        // remove the sessions of the character
        delete characters[characterName]
        for (let location in locations) {
          locations[location] = locations[location].filter(
            _id => sessions.indexOf(_id) < 0
          )
        }
        parseJSONFile(storyJson, this)
      }
    }
  }

  /**
   * change the life circle of characters
   * @param {String | Number} character
   * @param {timeSpan[]} timeRange
   */
  changeCharacter(character, timeRange = []) {
    const characterName =
      typeof character === 'number'
        ? this.getCharacterName(character)
        : character
    if (characterName) {
      this.deleteCharacter(characterName)
      this.addCharacter(characterName, timeRange)
    }
  }

  /**
   * change the sessions of characters
   * WARN!: this operation will disturb locations
   * @param {Number} sessionID
   * @param {String | Number[]} characters
   * @param {timeSpan} timeSpan
   */
  changeSession(sessionID, characters = [], timeSpan, isHardBoundary = false) {
    if (isHardBoundary) {
      const [start, end] = timeSpan
      this.addTimeStamp(start)
      this.addTimeStamp(end)
    }
    this._changeSessionSoft(sessionID, characters, timeSpan)
  }

  _changeSessionSoft(sessionID, characters = [], timeSpan) {
    let timeSteps = this.getTimeSteps([timeSpan])
    let session = this.getTable('session')
    for (let i = 0; i < characters.length; i++) {
      let character = characters[i]
      if (typeof character === 'string') {
        character = this.getCharacterID(character)
      }
      if (character !== null) {
        for (let j = 0; j < timeSteps.length; j++) {
          session.replace(character, timeSteps[j], sessionID)
        }
      }
    }
  }

  /**
   * change the locations of characters
   * @param {String} location
   * @param {Number[]} sessions
   */
  changeLocation(location, sessions) {
    if (this._locations.indexOf(location) < 0) {
      this._locations.push(location)
    }
    let locationID = this.getLocationID(location)
    if (locationID === null) return
    const locationTable = this.getTable('location')
    const sessionTable = this.getTable('session')
    for (let i = 0, len = this.getTableRows(); i < len; i++) {
      for (let j = 0, len = this.getTableCols(); j < len; j++) {
        const sessionID = sessionTable.value(i, j)
        if (sessions.indexOf(sessionID) > -1) {
          locationTable.replace(i, j, locationID)
        }
      }
    }
  }

  /**
   * get character name
   * @param {Number} characterID
   * @returns
   * - name: string | null
   */
  getCharacterName(characterID) {
    return characterID < this._characters.length
      ? this._characters[characterID]
      : null
  }

  /**
   * get character ID
   * @param {String} characterName
   * @returns
   * - ID: number | null
   */
  getCharacterID(characterName) {
    const characterID = this._characters.indexOf(characterName)
    return characterID > -1 ? characterID : null
  }

  /**
   * get the time range of characters
   * @param {String | Number} character
   * @returns
   * - timeRange: [[t1, t2], ..]
   */
  getCharacterTimeRange(character) {
    character =
      typeof character === 'number' ? character : this.getCharacterID(character)
    let timeRange = []
    if (character !== null) {
      for (let i = 0; i < this.getTableCols(); i++) {
        if (this._tableMap.get('character').value(character, i) === 1) {
          timeRange.push([this._timeStamps[i], this._timeStamps[i + 1]])
        }
      }
    }
    return timeRange
  }

  /**
   * get session ID
   * @param {Number} timeStamp
   * @param {String} characterName
   * @returns
   * - ID: number
   */
  getSessionID(timeStamp, characterName) {
    let timeStep = this.getTimeStep(timeStamp)
    let characterID = this.getCharacterID(characterName)
    if (timeStep !== null && characterID !== null) {
      return this.getTable('session').value(characterID, timeStep)
    }
    return null
  }

  /**
   * increment maxSessionID
   */
  getNewSessionID() {
    return ++this._maxSessionID
  }

  /**
   * get characters according to the session
   * @param {Number} sessionID
   * @returns
   * - characterIDs: number[]
   */
  getSessionCharacters(sessionID) {
    let characterIDs = new Set()
    for (let i = 0; i < this.getTableRows(); i++) {
      for (let j = 0; j < this.getTableCols(); j++) {
        if (
          this.getTable('character').value(i, j) == 1 &&
          this.getTable('session').value(i, j) === sessionID
        ) {
          characterIDs.add(i)
          break
        }
      }
    }
    return Array.from(characterIDs)
  }

  /**
   * get the timeSpan of sessions
   * @param {Number} sessionID
   * @returns
   * - timeRange: timeSpan[]
   */
  getSessionTimeRange(sessionID) {
    let timeSteps = []
    for (let i = 0; i < this.getTableRows(); i++) {
      for (let j = 0; j < this.getTableCols(); j++) {
        if (
          this.getTable('session').value(i, j) === sessionID &&
          timeSteps.indexOf(j) < 0
        ) {
          timeSteps.push(j)
        }
      }
    }
    return timeSteps.map(step => [
      this._timeStamps[step],
      this._timeStamps[step + 1],
    ])
  }

  /**
   * get location name
   * @param {Number} locationID
   * @returns
   * - locationName: string
   */
  getLocationName(locationID) {
    return locationID < this._locations.length
      ? this._locations[locationID]
      : null
  }

  /**
   * get location ID
   * @param {String} locationName
   * @returns
   * - locationID: number
   */
  getLocationID(locationName) {
    const locationID = this._locations.indexOf(locationName)
    return locationID > -1 ? locationID : null
  }

  /**
   * get characters according to the location
   * @param {String | Number} location
   * @returns
   * - characterIDs: number[]
   */
  getLocationCharacters(location) {
    if (typeof location == 'string') {
      location = this.getLocationID(location)
    }
    let characterIDs = new Set()
    for (let i = 0; i < this.getTableRows(); i++) {
      for (let j = 0; j < this.getTableCols(); j++) {
        if (
          this._tableMap.get('character').value(i, j) == 1 &&
          this._tableMap.get('location').value(i, j) === location
        ) {
          characterIDs.add(i)
        }
      }
    }
    return Array.from(characterIDs)
  }

  /**
   * get session according to the location
   * @param {String | Number} location
   * @returns
   * - sessionIDs: number[]
   */
  getLocationSessions(location) {
    if (typeof location == 'string') {
      location = this.getLocationID(location)
    }
    if (location !== null) {
      let sessionIDs = new Set()
      for (let i = 0; i < this.getTableRows(); i++) {
        for (let j = 0; j < this.getTableCols(); j++) {
          if (
            this.getTable('character').value(i, j) == 1 &&
            this.getTable('location').value(i, j) === location
          ) {
            sessionIDs.add(this._tableMap.get('session').value(i, j))
          }
        }
      }
      let ans = Array.from(sessionIDs)
      ans.sort((a, b) => a - b)
      return ans
    }
    return []
  }
  cleanPaths() {
    this._paths = []
  }
  cleanPositions() {
    this._positions = []
  }
  addPath(path) {
    this._paths.push(path)
    return this._paths.length - 1
  }
  addPosition(pos) {
    this._positions.push(pos)
    return this._positions.length - 1
  }
}
