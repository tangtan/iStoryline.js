import { Table } from "./util";

export class Story {
  constructor() {
    this._tableMap = new Map();
    this._characters = [];
    this._locations = [];
    this._timeStamps = [];
  }

  /**
   * read xml/json document
   */
  load(fileUrl, fileType) {}

  /**
   * export xml/json document
   */
  dump(fileName, fileType) {}

  /**
   * get table (tableMap)
   * @param {string} tableName
   * @returns
   * - table: Table
   */
  getTable(tableName) {}

  /**
   * set table (tableMap)
   * @param {String} tableName
   * @param {Table} table
   */
  setTable(tableName, table) {}

  getTableRows() {
    return this._characters.length || 0;
  }

  getTableCols() {
    return this._timeStamps.length || 0;
  }

  /**
   * change the status of characters
   * @param {String | Number} character
   * @param {Number[]} timeSteps
   * @param {Boolean} isActivated
   */
  changeCharacter(character, timeSteps = [], isActivated = true) {}

  /**
   * add characters to table
   * @param {String} characterName
   * @param {timeSpan[]} timeRange
   */
  addCharacter(characterName, timeRange = []) {}

  addTimeStamp() {}

  deleteTimeStamp() {}

  mergeTimeStamp() {}

  splitTimeStamp() {}

  /**
   * delete characters from table
   * @param {String | Number} character
   */
  deleteCharacter(character) {}

  /**
   * change the sessions of characters
   * @param {Number} sessionID
   * @param {String | Number[]} characters
   * @param {Number[]} timeSteps
   */
  changeSession(sessionID, characters = [], timeSteps = []) {}

  /**
   * change the sessions of characters
   * @param {String | Number[]} characters
   * @param {Number[]} timeSpan
   */
  addSession(characters = [], timeSpan = []) {}

  /**
   * delete sessions from table
   * @param {Number} sessionID
   */
  deleteSession(sessionID) {}

  /**
   * change the locations of characters
   * @param {Number | String | null} location
   * @param {Number | String[]} characters
   * @param {Number[]} timeRange
   */
  changeLocation(location, characters = [], timeRange = []) {}

  /**
   * get character name
   * @param {String} characterID
   * @returns
   * - name: string
   */
  getCharacterName(characterID) {}

  /**
   * get character ID
   * @param {String} characterName
   * @returns
   * - ID: number
   */
  getCharacterID(characterName) {}

  /**
   * get the time range of characters
   * @param {String | Number} character
   * @returns
   * - timeRange: [[t1, t2], ..]
   */
  getCharacterTimeRange(character) {}

  /**
   * get location name
   * @param {Number} locationID
   * @returns
   * - locationName: string
   */
  getLocationName(locationID) {}

  /**
   * get location ID
   * @param {String} locationName
   * @returns
   * - locationID: number
   */
  getLocationID(locationName) {}

  /**
   * get characters according to the location
   * @param {String | Number} location
   * @returns
   * - characterIDs: number[]
   */
  getLocationCharacters(location) {}

  /**
   * get session according to the location
   * @param {String | Number} location
   * @returns
   * - sessionIDs: number[]
   */
  getLocationSessions(location) {}

  /**
   * get characters according to the session
   * @param {Number} sessionID
   * @returns
   * - characterIDs: number[]
   */
  getSessionCharacters(sessionID) {}

  /**
   * get the timeSpan of sessions
   * @param {Number} sessionID
   * @returns
   * - timeRange: timeSpan[]
   */
  getSessionTimeRange(sessionID) {}
}
