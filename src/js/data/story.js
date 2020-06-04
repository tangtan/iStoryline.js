import * as d3 from "d3";
import { Table } from "./table";
import {
  parseXMLFile,
  parseJSONFile,
  dumpXMLFile,
  dumpJSONFile,
  generateJSONFile
} from "../utils/io";
import { sessionScissors } from "../utils/sessionScissors";

export class Story {
  constructor() {
    this.restore();
  }

  /**
   * init story
   */
  restore() {
    this._tableMap = new Map();
    this._tableMap.set("character", new Table());
    this._tableMap.set("session", new Table());
    this._tableMap.set("location", new Table());
    this._characters = [];
    this._locations = [];
    this._timeStamps = [];
    this._maxSessionID = -1;
  }

  get characters() {
    return this._characters;
  }

  get locations() {
    return this._locations;
  }

  get timeline() {
    return this._timeStamps;
  }

  /**
   * read xml/json document
   * @param {string} fileUrl
   * @param {string} fileType
   * @returns
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
   * @param {string} fileUrl
   * @param {string} fileType
   * @returns
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
  setTable(tableName, table) {
    this._tableMap.set(tableName, table);
  }

  getTableRows() {
    return this._characters.length || 0;
  }

  getTableCols() {
    return this._timeStamps.length - 1 || 0;
  }

  /**
   * change timeStamp to timeStep
   * @param {Number} timeStamp
   * @returns
   * - timeStep: number
   */
  getTimeStep(timeStamp) {
    for (let i = 0, len = this.getTableCols() + 1; i < len; i++) {
      if (this._timeStamps[i] >= timeStamp) {
        return i - 1;
      }
    }
    return -1;
  }

  /**
   * change timeRange to timeSteps
   * @param {timeSpan[]} timeRange
   * @returns
   * - timeSteps: number[]
   */
  getTimeSteps(timeRange) {
    let tmpTimeSteps = [],
      timeSteps = [];
    timeRange.forEach(timeSpan => {
      let l = -1,
        r = -1;
      for (let i = 0; i < this.getTableCols(); i++) {
        if (
          this._timeStamps[i] <= timeSpan[0] &&
          timeSpan[0] < this._timeStamps[i + 1]
        )
          l = i;
        if (
          this._timeStamps[i] < timeSpan[1] &&
          timeSpan[1] <= this._timeStamps[i + 1]
        )
          r = i;
      }
      for (let i = l; i <= r; i++) tmpTimeSteps.push(i);
    });
    tmpTimeSteps.sort();
    if (tmpTimeSteps.length >= 1) timeSteps.push(tmpTimeSteps[0]);
    for (let i = 1; i < tmpTimeSteps.length; i++) {
      if (tmpTimeSteps[i] !== timeSteps[timeSteps.length - 1]) {
        timeSteps.push(tmpTimeSteps[i]);
      }
    }
    return timeSteps;
  }

  /**
   * add timestamp to timestamps
   * @param {Number} timeStamp //real time not index
   */
  addTimeStamp(timeStamp) {}

  /**
   * delete timestamp to timestamps //real time not index
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
      this.changeCharacter(characterName, timeRange);
    } else {
      const storyJson = generateJSONFile(this);
      const sessionID = ++this._maxSessionID;
      const locations = storyJson.Story.Locations;
      const characters = storyJson.Story.Characters;
      if (locations.All) {
        locations.All.push(sessionID);
      } else {
        locations["All"] = [sessionID];
      }
      characters[characterName] = timeRange.map(timeSpan => {
        return {
          Start: timeSpan[0],
          End: timeSpan[1],
          Session: sessionID
        };
      });
      // debugger
      parseJSONFile(storyJson, this);
    }
  }

  /**
   * delete characters from the story
   * @param {String | Number} character
   */
  deleteCharacter(character) {
    const characterName =
      typeof character === "number"
        ? this.getCharacterName(character)
        : character;
    if (characterName) {
      const storyJson = generateJSONFile(this);
      const locations = storyJson.Story.Locations;
      const characters = storyJson.Story.Characters;
      if (characters.hasOwnProperty(characterName)) {
        const sessions = characters[characterName].map(span => span["Session"]);
        // remove the sessions of the character
        delete characters[characterName];
        for (let location in locations) {
          locations[location] = locations[location].filter(
            _id => sessions.indexOf(_id) < 0
          );
        }
        parseJSONFile(storyJson, this);
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
      typeof character === "number"
        ? this.getCharacterName(character)
        : character;
    if (characterName) {
      this.deleteCharacter(characterName);
      this.addCharacter(characterName, timeRange);
    }
  }

  /**
   * change the sessions of characters
   * @param {Number} sessionID
   * @param {String | Number[]} characters
   * @param {timeSpan} timeSpan
   */
  changeSession(sessionID, characters = [], timeSpan, isHardBoundary = true) {
    if (isHardBoundary) {
      const storyJson = generateJSONFile(this);
      const characterDict = storyJson.Characters;
      characters.forEach(character => {
        const characterName =
          typeof character === "number"
            ? this.getCharacterName(character)
            : character;
        if (characterName) {
          let tmpSessions = [];
          characterDict[characterName].forEach(session => {
            const newSessions = sessionScissors(session, sessionID, timeSpan);
            tmpSessions.push(...newSessions);
          });
          characterDict[characterName] = tmpSessions;
        }
      });
    } else {
      this.changeSessionSoft(sessionID, characters, timeSpan);
    }
  }

  changeSessionSoft(sessionID, characters = [], timeSpan) {
    let timeSteps = this.getTimeSteps([timeSpan]);
    let session = this.getTable("session");
    for (let i = 0; i < characters.length; i++) {
      let character = characters[i];
      if (typeof character === "string") {
        character = this.getCharacterID(character);
      }
      if (character !== null) {
        for (let j = 0; j < timeSteps.length; j++) {
          session.replace(character, timeSteps[j], sessionID);
        }
      }
    }
  }

  /**
   * change the locations of characters
   * @param {Number | String | null} location
   * @param {Number | String[]} characters
   * @param {Number[]} timeRange
   */
  changeLocation(location, characters = [], timeRange = []) {
    let timeSteps = this.getTimeSteps(timeRange);
    let locations = this._tableMap.get("location");
    let rec = 0; //0 represents the default location
    for (let i = 1; i < this._locations; i++) {
      if (location === this._locations[i]) {
        rec = i;
      }
    }
    if (location && rec === 0) {
      this._locations.push(location);
      rec = this._locations.length - 1;
    }
    for (let i = 0; i < characters.length; i++) {
      let character = characters[i];
      if (typeof character === "string") {
        character = this.getCharacterID(character);
      }
      for (let j = 0; j < timeSteps.length; j++) {
        locations.replace(character, timeSteps[j], rec);
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
      : null;
  }

  /**
   * get character ID
   * @param {String} characterName
   * @returns
   * - ID: number | null
   */
  getCharacterID(characterName) {
    const characterID = this._characters.indexOf(characterName);
    return characterID > -1 ? characterID : null;
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
   * increment maxSessionID
   */
  getNewSessionID() {
    return ++this._maxSessionID;
  }

  /**
   * get the time range of characters
   * @param {String | Number} character
   * @returns
   * - timeRange: [[t1, t2], ..]
   */
  getCharacterTimeRange(character) {
    character =
      typeof character === "number"
        ? character
        : this.getCharacterID(character);
    let timeRange = [];
    if (character !== null) {
      for (let i = 0; i < this.getTableCols(); i++) {
        if (this._tableMap.get("character").value(character, i) === 1) {
          timeRange.push([this._timeStamps[i], this._timeStamps[i + 1]]);
        }
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
