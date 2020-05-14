import { Table } from "./table";

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

  /**
   * read xml/json document
   */
  async load(fileUrl, fileType) {
    if (fileType === "xml") {
      const xml = await d3.xml(fileUrl);
      this._parseXml(xml);
    } else if (fileType === "json") {
      const json = await d3.json(fileUrl);
      // this._parseJson(json)
    } else {
      console.error("wrong fileType!");
    }
  }

  _parseXml(xml) {
    let story = xml.querySelector("Story");
    if (story) {
      let characters = story.querySelector("Characters");
      characters = characters.querySelectorAll("Character");
      for (let character of characters) {
        let name = character.getAttribute("Name");
        this._characters.push(name);
        let spans = character.querySelectorAll("Span");
        for (let span of spans) {
          let start = span.getAttribute("Start");
          let end = span.getAttribute("End");
          this._timeStamps.push(start, end);
        }
      }
      const timeset = new Set(this._timeStamps);
      this._timeStamps = Array.from(timeset);
      this._timeStamps.sort();
      let sessionTable = this._tableMap.get("sessionTable");
      let timeTable = this._tableMap.get("timeTable");
      let locationTable = this._tableMap.get("locationTable");
      for (let table of [sessionTable, timeTable, locationTable]) {
        table.resize(this._characters.length, this._timeStamps.length);
      }
      for (let character of characters) {
        let spans = character.querySelectorAll("Span");
        let characterName = character.getAttribute("Name");
        let characterId = this._characters.indexOf(characterName);
        for (let span of spans) {
          let start = span.getAttribute("Start");
          let timeId = this._timeStamps.indexOf(start);
          timeTable.replace(characterId, timeId, 1);
          let sessionId = span.getAttribute("Session");
          sessionId = parseInt(sessionId);
          sessionTable.replace(characterId, timeId, sessionId);
        }
      }
      //parse the location part
      let locations = story.querySelector("Locations");
      locations = story.querySelectorAll("Location");
      for (let location of locations) {
        let locationTable = this._tableMap.get("locationTable");
        let sessionTable = this._tableMap.get("sessionTable");
        let timeTable = this._tableMap.get("timeTable");
        let locationName = location.getAttribute("Name");
        this._locations.push(locationName);
        const locationId = this._locations.length - 1;
        let sessionsInthislocation = location
          .getAttribute("Sessions")
          .split(",");
        sessionsInthislocation = sessionsInthislocation.map(x => parseInt(x));
        for (let i = 0; i < sessionTable.rows; i++)
          for (let j = 0; j < sessionTable.cols; j++) {
            if (
              timeTable.value(i, j) &&
              sessionTable.value(i, j) in sessionsInthislocation
            ) {
              locationTable.replace(i, j, locationId);
            }
          }
      }
      console.log(this);
    } else {
      console.error("No story in this Url!");
    }
  }

  /**
   * export xml/json document
   */
  dump(fileName, fileType) {
    if (fileType === "xml") {
      // dumpXml(xml)
    } else if (fileType === "json") {
      // dumpJson(json)
    } else {
      console.error("wrong fileType!");
    }
  }

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
