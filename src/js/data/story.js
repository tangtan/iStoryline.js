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
    this._maxSessionID = 0; //#TODO
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
   * change timerange to timeSteps
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
   * change the status of characters
   * @param {String | Number} character
   * @param {timeSpan[]} timeRange //This is the index of timespan, translate first
   * @param {Boolean} isActivated
   */
  changeCharacter(character, timeRange = [], isActivated = true) {
    //#TODO:If the real time is not in _timeStamps, add it to _timeStamp.
    //Now just replace it using the nearest timestamp.
    let timeSteps = this.getTimeSteps(timeRange);
    characters = this._tableMap.get("character");
    let newCharacters = [];
    for (let i = 0; i < this.getTableRows(); i++) {
      newCharacters[i] = [];
      for (let j = 0; j < this.getTableCols(); j++)
        newCharacters[i][j] = characters.value(i, j);
    }
    for (let j = 0; j < timeSteps.length; j++) {
      if (typeof character === "number") {
        //#TODO: If it is Number (not number), this may be instanceof Number
        newCharacters[character][timeSteps[j]] = isActivated;
      } else {
        newCharacter[this.getCharacterID(character)][
          timeSteps[j]
        ] = isActivated;
      }
    }
    this.setTable("character", new Table(newCharacters));
  }

  /**
   * add characters to table
   * @param {String} characterName
   * @param {timeSpan[]} timeRange
   */
  addCharacter(characterName, timeRange = []) {
    let newCharacterName = true;
    this._characters.forEach(_characterName => {
      if (_characterName === characterName) {
        newCharacterName = false;
      }
    });
    timeRange.forEach(timeSpan => {
      this.addTimeStamp(timeSpan[0]);
      this.addTimeStamp(timeSpan[1]);
    });
    let timeSteps = this.getTimeSteps(timeRange);
    if (newCharacterName) {
      let characters = this._tableMap.get("character");
      let locations = this._tableMap.get("location");
      let sessions = this._tableMap.get("session");
      let newCharacter = [];
      let newLocation = [];
      let newSession = [];
      for (let i = 0; i < this.getTableCols(); i++) {
        newCharacter[i] = false;
        newLocation[i] = 0;
        newSession[i] = 0;
      }
      for (let i = 0; i < timeSteps.length; i++) {
        newCharacter[timeSteps[i]] = true;
      }
      characters.extend(this.getTableRows(), newCharacter, false);
      locations.extend(this.getTableRows(), newLocation, false);
      sessions.extend(this.getTableRows(), newSession, false);
      this._characters.push(characterName);
      this.setTable("character", characters);
      this.setTable("location", locations);
      this.setTable("session", sessions);
    }
  }
  /**
   * add timestamp to timestamps
   * @param {Number} timeStamp //real time not index
   */
  addTimeStamp(timeStamp) {
    let newTimeStamp = true;
    this._timeStamps.forEach(_timeStamp => {
      if (_timeStamp === timeStamp) newTimeStamp = false;
    });
    if (newTimeStamp) {
      let colID = -1,
        defVal = true;
      for (let j = 0; j < this.getTableCols() + 1; j++) {
        if (this._timeStamps[j] > timeStamp) {
          colID = j;
          break;
        }
      }
      if (colID == -1) {
        colID = this.getTableCols() + 1;
        defVal = false;
      }
      let newTimeStamps = this.insertCol(
        this._timeStamps,
        colID,
        timeStamp,
        false,
        false
      );
      if (this.getTableCols() >= 0) {
        let newCharacters = this.insertTableCol(
          this._tableMap.get("character"),
          defVal ? colID : colID - 1,
          false,
          defVal
        );
        let newLocations = this.insertTableCol(
          this._tableMap.get("location"),
          defVal ? colID : colID - 1,
          0,
          defVal
        );
        let newSessions = this.insertTableCol(
          this._tableMap.get("session"),
          defVal ? colID : colID - 1,
          0,
          defVal
        );
        this.setTable("character", newCharacters);
        this.setTable("location", newLocations);
        this.setTable("session", newSessions);
      }
      this._timeStamps = newTimeStamps;
    }
  }
  /**
   * delete timestamp to timestamps //real time not index
   * @param {Number} timeStamp
   */
  deleteTimeStamp(timeStamp) {
    let colID = -1;
    for (let i = 0; i < this.getTableCols() + 1; j++) {
      if (this._timeStamps[i] === timeStamp) {
        colID = i;
      }
    }
    if (colID != -1) {
      let newTimeStamps = this.deleteCol(this._timeStamps, colID, false);
      if (colID === this.getTableCols()) colID--;
      let newCharacters = this.deleteTableCol(
        this._tableMap.get("character"),
        colID
      );
      let newLocations = this.deleteTableCol(
        this._tableMap.get("location"),
        colID
      );
      let newSessions = this.deleteTableCol(
        this._tableMap.get("session"),
        colID
      );
      this.setTable("character", newCharacters);
      this.setTable("location", newLocations);
      this.setTable("session", newSessions);
      this._timeStamps = newTimeStamps;
    }
  }
  insertTableCol(preTable, colID, val = 0, defVal = true) {
    let newTable = [];
    let colRange = [];
    for (let j = 0; j < this.getTableCols(); j++) colRange.push(j);
    for (let i = 0; i < this.getTableRows(); i++) {
      newTable[i] = this.insertCol(
        preTable.subtable(i, colRange),
        colID,
        val,
        defVal,
        true
      );
    }
    return new Table(newTable.length ? newTable : 0);
  }
  deleteTableCol(preTable, colID) {
    let newTable = [];
    let colRange = [];
    for (let j = 0; j < this.getTableCols(); j++) colRange.push(j);
    for (let i = 0; i < this.getTableRows(); i++) {
      newTable[i] = this.deleteCol(preTable.subtable(i, colRange), colID);
    }
    return new Table(newTable.length ? newTable : 0);
  }
  insertCol(preArray, colID, val = 0, defVal = true, isTable = true) {
    let newArray = [];
    let i = 0;
    for (i = 0; i < colID && i < this.getTableCols() + (isTable ? 0 : 1); i++) {
      if (isTable) newArray.push(preArray.value(0, i));
      else newArray.push(preArray[i]);
    }

    if (defVal && i != 0) {
      if (isTable) newArray.push(preArray.value(0, i - 1));
      else newArray.push(preArray[i - 1]);
    } else newArray.push(val);
    for (i = colID; i < this.getTableCols() + (isTable ? 0 : 1); i++) {
      if (isTable) newArray.push(preArray.value(0, i));
      else newArray.push(preArray[i]);
    }
    return newArray;
  }
  deleteCol(preArray, colID, isTable = true) {
    let newArray = [];
    for (i = 0; i < this.getTableCols() + (isTable ? 0 : 1); i++) {
      if (i != colID) {
        if (isTable) newArray.push(preArray.value(0, i));
        else newArray.push(preArray[i]);
      }
    }
    return newArray;
  }
  /**
   * delete characters from table
   * @param {String | Number} character
   */
  deleteCharacter(character) {
    //#TODO:Delete the timestamps of this charater
    //Scan "timespan" of every character, but now no datastructure save this info.
    if (typeof character === "string") {
      //String or string ?
      character = this.getCharacterID(character);
    }
    let newCharacters = [],
      cnt = 0;
    let characters = this._tableMap.get("character");
    for (let i = 0; i < this.getTableRows(); i++) {
      if (i !== character) {
        newCharacters[cnt] = [];
        for (let j = 0; j < this.getTableCols(); j++) {
          newCharacters[cnt].push(characters.value(i, j));
        }
        cnt++;
      }
    }
    this.setTable("character", new Table(newCharacters));
  }

  /**
   * change the sessions of characters
   * @param {Number} sessionID
   * @param {String | Number[]} characters
   * @param {timeSpan[]} timeRange
   */
  changeSession(sessionID, characters = [], timeRange = []) {
    let timeSteps = this.getTimeSteps(timeRange);
    let session = this._tableMap.get("session");
    for (let i = 0; i < characters.length; i++) {
      let character = characters[i];
      if (typeof character === "string") {
        character = this.getCharacterID(character);
      }
      for (let j = 0; j < timeSteps.length; j++) {
        session.replace(character, timeSteps[j], sessionID);
      }
    }
    this.setTable("session", session);
  }

  /**
   * change the sessions of characters
   * @param {String | Number[]} characters
   * @param {Number[]} timeSpan
   */
  addSession(characters = [], timeSpan = []) {
    //#TODO:maxSessionID
    let timeSteps = this.getTimeSteps([timeSpan]);
    this._maxSessionID++;
    this.changeSession(this._maxSessionID, characters, timeSteps);
  }

  /**
   * delete sessions from table
   * @param {Number} sessionID
   */
  deleteSession(sessionID) {
    let session = this._tableMap.get("session");
    for (let i = 0; i < this.getTableRows(); i++) {
      for (let j = 0; j < this.getTableCols(); j++) {
        if (session.value(i, j) == sessionID) {
          session.replace(i, j, 0);
        }
      }
    }
    this.setTable("session", session);
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
