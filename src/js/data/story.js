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
    this._tableMap.set("timeTable", new Table(0));
    this._tableMap.set("sessionTable", new Table(0));
    this._tableMap.set("locationTable", new Table(0));
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
   * get the time range of characters
   * @param {String | Number} character
   * @returns
   * - timeRange: [[t1, t2], ..]
   */
  getCharacterTimeRange(character) {
    if (character instanceof String) {
      character = this.getCharacterID(character);
    }
    //从character table中取到这个人不为零的timeStep
    //从timeStamps中取到timeSpan
    //拼接
    var timeRange = [];
    for (let i = 0; i < this.getTableCols(); i++) {
      if (this._tableMap.get("timeTable").value(i, character) === 1) {
        this.timeRange.push(this._timeStamps[i]);
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
    if (location instanceof String) {
      location = getLocationID(location);
    }
    var characterIDs = [];
    for (let i = 0; i < this.getTableRows(); i++) {
      for (let j = 0; j < this.getTableCols(); j++) {
        if (this._tableMap.get("locationTable").value(j, i) === location) {
          characterIDs.append(i);
        }
      }
    }
    return characterIDs;
  }

  /**
   * get session according to the location
   * @param {String | Number} location
   * @returns
   * - sessionIDs: number[]
   */
  getLocationSessions(location) {
    if (location instanceof String) {
      location = getLocationID(location);
    }
    var sessionIDs = [];
    for (let i = 0; i < this.getTableRows(); i++) {
      for (let j = 0; j < this.getTableCols(); j++) {
        if (this._tableMap.get("locationTable").value(j, i) === location) {
          sessionIDs.append(this._tableMap.get("sessionTable").value(j, i));
        }
      }
    }
    return sessionIDs;
  }

  /**
   * get characters according to the session
   * @param {Number} sessionID
   * @returns
   * - characterIDs: number[]
   */
  getSessionCharacters(sessionID) {
    var characterIDs = [];
    for (let i = 0; i < this.getTableRows(); i++) {
      for (let j = 0; j < this.getTableCols(); j++) {
        if (this._tableMap.get("sessionTable").value(j, i) === sessionID) {
          characterIDs.append(i);
          break;
        }
      }
    }
    return characterIDs;
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
        if (this._tableMap.get("sessionTable").value(j, i) === sessionID) {
          return this._timeStamps[j];
        }
      }
    }
  }
}
