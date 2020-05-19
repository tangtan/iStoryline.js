import * as d3 from "d3";
import { Table } from "./table";
import {
  parseXMLFile,
  parseJSONFile,
  dumpXMLFile,
  dumpJSONFile
} from "../utils/io";

export class Story {
  constructor() {
    this._tableMap = new Map();
    this._tableMap.set("character", new Table(0));
    this._tableMap.set("session", new Table(0));
    this._tableMap.set("location", new Table(0));
    this._characters = [];
    this._locations = [];
    this._timeStamps = [];
  }

  get characters() {
    return this._characters;
  }

  get locations() {
    return this._locations;
  }

  /**
   * read xml/json document
   */
  async load(fileUrl, fileType) {
    if (fileType === "xml") {
      const xml = await d3.xml(fileUrl);
      parseXMLFile(xml, this);
    } else if (fileType === "json") {
      const json = await d3.json(fileUrl);
      parseJSONFile(json, this);
    } else {
      console.error("Wrong fileType!");
    }
  }

  /**
   * export xml/json document
   */
  dump(fileName, fileType) {
    if (fileType === "xml") {
      dumpXMLFile(fileName, this);
    } else if (fileType === "json") {
      dumpJSONFile(fileName, this);
    } else {
      console.error("Wrong fileType!");
    }
  }

  /**
   * get table (tableMap)
   * @param {string} tableName
   * @returns
   * - table: Table
   */
  getTable(tableName) {
    return this._tableMap.get(tableName);
  }

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
    return this._timeStamps.length - 1 || 0;
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
  getCharacterName(characterID) {
    return this._characters[characterID];
  }

  /**
   * get character ID
   * @param {String} characterName
   * @returns
   * - ID: number
   */
  getCharacterID(characterName) {
    return this._characters.indexOf(characterName);
  }

  /**
   * get session ID
   * @param {Number} timeStamp
   * @param {String} characterName
   * @returns
   * - ID: number
   */
  getSessionID(timeStamp, characterName) {
    let timeID = this._timeStamps.indexOf(timeStamp);
    let characterID = this.getCharacterID(characterName);
    return this._tableMap.get("session").value(characterID, timeID);
  }

  /**
   * get the time range of characters
   * @param {String | Number} character
   * @returns
   * - timeRange: [[t1, t2], ..]
   */
  getCharacterTimeRange(character) {
    if (typeof character == "string") {
      character = this.getCharacterID(character);
    }
    let timeRange = [];
    for (let i = 0; i < this.getTableCols(); i++) {
      if (
        this._tableMap.get("character").value(character, i) == 1 &&
        this._tableMap.get("character").value(character, i) === 1
      ) {
        timeRange.push([this._timeStamps[i], this._timeStamps[i + 1]]);
      }
    }
    return timeRange;
  }

  /**
   * get location name
   * @param {Number} locationID
   * @returns
   * - locationName: string
   */
  getLocationName(locationID) {
    return this._locations[locationID];
  }

  /**
   * get location ID
   * @param {String} locationName
   * @returns
   * - locationID: number
   */
  getLocationID(locationName) {
    return this._locations.indexOf(locationName);
  }

  /**
   * get characters according to the location
   * @param {String | Number} location
   * @returns
   * - characterIDs: number[]
   */
  getLocationCharacters(location) {
    if (typeof location == "string") {
      location = this.getLocationID(location);
    }
    let characterIDs = new Set();
    for (let i = 0; i < this.getTableRows(); i++) {
      for (let j = 0; j < this.getTableCols(); j++) {
        if (
          this._tableMap.get("character").value(i, j) == 1 &&
          this._tableMap.get("location").value(i, j) === location
        ) {
          characterIDs.add(i);
        }
      }
    }
    return Array.from(characterIDs);
  }

  /**
   * get session according to the location
   * @param {String | Number} location
   * @returns
   * - sessionIDs: number[]
   */
  getLocationSessions(location) {
    if (typeof location == "string") {
      location = this.getLocationID(location);
    }
    let sessionIDs = new Set();
    for (let i = 0; i < this.getTableRows(); i++) {
      for (let j = 0; j < this.getTableCols(); j++) {
        if (
          this._tableMap.get("character").value(i, j) == 1 &&
          this._tableMap.get("location").value(i, j) === location
        ) {
          sessionIDs.add(this._tableMap.get("session").value(i, j));
        }
      }
    }
    let ans = Array.from(sessionIDs);
    ans.sort((a, b) => a - b);
    return ans;
  }

  /**
   * get characters according to the session
   * @param {Number} sessionID
   * @returns
   * - characterIDs: number[]
   */
  getSessionCharacters(sessionID) {
    let characterIDs = new Set();
    for (let i = 0; i < this.getTableRows(); i++) {
      for (let j = 0; j < this.getTableCols(); j++) {
        if (
          this._tableMap.get("character").value(i, j) == 1 &&
          this._tableMap.get("session").value(i, j) === sessionID
        ) {
          characterIDs.add(i);
          break;
        }
      }
    }
    return Array.from(characterIDs);
  }

  /**
   * get the timeSpan of sessions
   * @param {Number} sessionID
   * @returns
   * - timeRange: timeSpan[]
   */
  getSessionTimeRange(sessionID) {
    for (let i = 0; i < this.getTableRows(); i++) {
      for (let j = 0; j < this.getTableCols(); j++) {
        if (this._tableMap.get("session").value(i, j) === sessionID) {
          return this._timeStamps[j];
        }
      }
    }
  }
}
