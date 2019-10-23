import { SessionStore } from "./session";

/**
 * dealing with the Character operations, e.g., add/change/remove
 *
 * @properties
 *   - data
 *     - locationTree
 *     - sessionTable
 *
 * @methods
 *   - addCharacter()
 *   - removeCharacter()
 *   - addCharacterSmart()
 *   - addCharacterToSession()
 */
export class CharacterStore extends SessionStore {
  constructor() {
    super();
  }

 /**
   * add a new Character between startTime and endTime
   *
   * @param
   *   characterName
   *     a string like 'Mother'
   *   startTime,endTime
   *     time not coordinate
   *
   * @return
   *   null.
   */
  addCharacter(characterName, startTime, endTime) {
    let locationTree = this.data.locationTree;
    if  (locationTree.children.length===0){
      this.addLocation(characterName);
    }
    this.addSession(
      [{ start: startTime, end: endTime, entity: characterName }],
       locationTree.children[locationTree.children.length - 1].name
    );
  }


  async readXMLFile(fileSrc){
    return await super.readXMLFile(fileSrc);
  }

  /**
   * remove character from startTime to endTime
   *
   * @param
   *   characterName
   *     the name of character such as 'Mother'
   *   startTime,endTime
   *     time not coordinate
   *
   * @return
   *   null.
   */
  removeCharacter(characterName, startTime, endTime) {
    let locationTree = this.data.locationTree;
    let sessionTable = this.data.sessionTable;
    function order2location(order) {
      let ans = null;
      if (locationTree.sessions.some(x => x === order)) {
        return [locationTree.name, locationTree];
      }
      locationTree.children.forEach(location => {
        if (location.sessions.some(x => x === order)) {
          ans = [location.name, location];
        }
      });
      return ans;
    }
    let delCha;
    let delSessionarr = [];
    for (let [_, chaArr] of sessionTable) {
      delCha = chaArr.find(
        cha =>
          cha.entity === characterName &&
          !(cha.start > endTime || cha.end < startTime)
      );
      if (delCha !== undefined) delSessionarr.push(_);
    }
    delSessionarr.forEach(order => {
      let session = sessionTable.get(order);
      let delChar = session.find(cha => cha.entity === characterName);
      if (delChar.start < startTime && delChar.end > endTime) {
        //删中间
        // let newleftSession=[];
        // let newrightSession=[];
        session.forEach(cha => {
          if (cha !== delChar) {
            // newleftSession.push({'start':cha.start,'end':startTime,'entity':cha.entity});
            // newrightSession.push({'start':endTime,'end':cha.end,'entity':cha.entity});
            // cha.start=startTime;
            // cha.end=endTime;
          } else {
            session.push({
              start: cha.start,
              end: startTime,
              entity: cha.entity
            });
            session.push({ start: endTime, end: cha.end, entity: cha.entity });
            session.splice(session.indexOf(cha), 1);
          }
        });
      } else if (delChar.start >= startTime && delChar.end > endTime) {
        //删左边
        // let newSession=[];
        session.forEach(cha => {
          if (cha !== delChar) {
            // newSession.push({'start':cha.start,'end':endTime,'entity':cha.entity});
          } else cha.start = endTime;
        });
        // if (newSession!==[])
        //     this.addSession(newSession,(order2location(order))[0]);
      } else if (delChar.start < startTime && delChar.end <= endTime) {
        //删右面
        // let newSession=[];
        session.forEach(cha => {
          if (cha !== delChar) {
            // newSession.push({'start':startTime,'end':cha.end,'entity':cha.entity});
          } else cha.end = startTime;
        });
        // if (newSession!==[])
        //     this.addSession(newSession,(order2location(order))[0]);
      } else {
        session.splice(session.indexOf(delChar), 1);
        if (session.length === 0) {
          // debugger;
          let delLocation = order2location(order)[1];
          sessionTable.delete(order);
          delLocation.sessions.splice(delLocation.sessions.indexOf(order), 1);
          if (
            delLocation.sessions.length === 0 &&
            delLocation.children === [] &&
            delLocation !== locationTree
          ) {
            locationTree.children.splice(
              locationTree.children.indexOf(delLocation),
              1
            );
          }
        }
      }
    });
  }
  /**
   * add a line after the ordering to achieve the effect of smart adding
   *
   * @param
   *  chaNam
   *     the name of added character
   *  startTime,endTime
   *     the time of start and end
   *
   * @return
   *   null
   */
  addCharacterSmart(chaName, startTime, endTime) {
    let sessionTable = this.data.sessionTable;
    function nametime2Session(name, time) {
      for (let [ID, session] of sessionTable) {
        if (
          session.some(
            cha => cha.entity === name && time <= cha.end && time >= cha.start
          )
        )
          return ID;
      }
      return null;
    }
    let sessionInfo = [];
    let sequence = this.sequence;
    let time = startTime;
    for (let i = 0; i < sequence.length; i++) {
      let sessionArr = sequence[i][1].sessionOrder;
      let lastSession = sessionArr[sessionArr.length - 1];
      if (time >= sequence[i + 1][0]) continue;
      if (endTime > sequence[i + 1][0]) {
        sessionInfo.push([
          time,
          sequence[i + 1][0],
          lastSession[1][0].start,
          lastSession[1][0].entity
        ]);
        time = sequence[i + 1][0];
      } //endTime<=sequence[i][0]
      else {
        sessionInfo.push([
          time,
          endTime,
          lastSession[1][0].start,
          lastSession[1][0].entity
        ]);
        break;
      }
    }
    for (let lastcha of sessionInfo) {
      this.addCharactertoSession(
        chaName,
        lastcha[0],
        lastcha[1],
        nametime2Session(lastcha[3], lastcha[0])
      );
    }
  }

  /**
   * add a new Character between startTime and endTime to a specific session
   *
   * @param
   *   characterName
   *     a string like 'Mother'
   *   startTime,endTime
   *     time not coordinate
   *   sessionID
   *
   * @return
   *   null.
   */
  addCharactertoSession(characterName, startTime, endTime, sessionID) {
    let locationTree = this.data.locationTree;
    let session = this.data.sessionTable.get(sessionID);
    session.push({ start: startTime, end: endTime, entity: characterName });
    if (locationTree.sessions.indexOf(sessionID) !== -1) {
      locationTree.entities.add(characterName);
    } else {
      let location2insert = locationTree.children.find(
        location => location.sessions.indexOf(sessionID) !== -1
      );
      location2insert.entities.add(characterName);
    }
  }
}