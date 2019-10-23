import { DataStore } from "./data";
import {xml} from "d3-fetch"
/**
 * dealing with the Sessig0f on operations, e.g., add/change/remove
 *
 * @properties
 *   - data
 *     - locationTree
 *     - sessionTable
 *
 * @methodsk
 *   - addSession()
 *   - changeSession()
 * 
 *   - removeSession()
 *   - addCharacterToSession()
 */
export class SessionStore extends DataStore {
  constructor() {
    super();
  }

async readXMLFile(fileSrc){
  return await super.readXMLFile(fileSrc);
}

  /**
   * add a Session in a specific location
   *
   * @param
   *   Session
   *     a Session is a array of Character such as [{'start':1,'end':2,'entity':'Mother'},{'start':1,'end':2,'entity':'GrandMother'}]
   *   LocationName
   *     name of the location you want to insert
   *
   * @return
   *   null.
   */
  addSession(Session,LocationName) {
    let locationTree = this.data.locationTree;
    let sessionTable = this.data.sessionTable;
    let maxSessionnum = 0;
    for (let [order, _] of sessionTable) {
      maxSessionnum = Math.max(maxSessionnum, order);
    }
    maxSessionnum++;
    sessionTable.set(maxSessionnum, Session);
    let locationtoInsert = (locationTree.name==LocationName)?locationTree:locationTree.children.find(
      location => location.name === LocationName
    );
    locationtoInsert.sessions.push(maxSessionnum);
  }

  /**
   * put all characters into a new session
   *
   * @param
   *   chaArr
   *     a array of names such as ['Mother','Wolf']
   *   startTime,endTime
   *     time not coordinate
   *
   * @return
   *   null.
   */
  changeSession(chaArr, startTime, endTime) {
    let locationTree = this.data.locationTree;
    let sessionTable = this.data.sessionTable;
    let allchangedCha = [];
    for (let characterName of chaArr) {
      let delCha;
      let delSessionarr = [];

      for (let [_, chaArr] of sessionTable) {
        delCha = chaArr.find(
          cha =>
            cha.entity === characterName &&
            !(startTime >cha.end || endTime <cha.start)
        );
        if (delCha !== undefined) delSessionarr.push(_);
      }
      delSessionarr.forEach(order => {
        let session = sessionTable.get(order);
        //删的在中间，在左边，在右边
        let delChar = session.find(cha => cha.entity === characterName);
        if (delChar.start < startTime && delChar.end > endTime) {
          allchangedCha.push({
            start: startTime,
            end: endTime,
            entity: delChar.entity
          });
        } else if (delChar.end > endTime && delChar.start > startTime) {
          allchangedCha.push({
            start: delChar.start,
            end: endTime,
            entity: delChar.entity
          });
        } else if (delChar.end < endTime && delChar.start < startTime) {
          allchangedCha.push({
            start: startTime,
            end: delChar.end,
            entity: delChar.entity
          });
        } else {
          allchangedCha.push(delChar);
        }
      });
      allchangedCha.forEach(deleteCha => {
        this.removeCharacter(deleteCha.entity, startTime, endTime);
      });
    }
    this.addSession(
      allchangedCha,
      locationTree.children[locationTree.children.length - 1].name
    );
  }



  /**
   * remove session from startTime to endTime and the state of characters in this session will be init to the former state
   *
   * @param
   *   characterName
   *     the name of a character in this session such as 'Mother'
   *   startTime,endTime
   *     time not coordinate
   *
   * @return
   *   null.
   */
  removeSession(characterName, startTime, endTime) {
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
    //和前面对齐，假如前面没有怎么办
    let locationTree = this.data.locationTree;
    let sessionTable = this.data.sessionTable;
    if (sessionTable.size===0) return ;
    let delSession, delOrder;
    outer: for (let [order, session] of sessionTable) {
      for (let cha of session) {
        if (
          cha.entity === characterName &&
          cha.start <= startTime &&
          cha.end >= endTime
        ) {
          delSession = session;
          delOrder = order;
          break outer;
        }
      }
    }
    
    let delLoationname = order2location(delOrder)[0];
    let delCha = [];
    for (let cha of delSession) {
      delCha.push([
        Math.max(cha.start, startTime),
        Math.min(cha.end, endTime),
        cha.entity
      ]);
    }
    for (let cha of delCha) {
      this.removeCharacter(cha[2], cha[0], cha[1]);
    }
    //都在一个session怎么办
    let session = nametime2Session(characterName, startTime);
    let flag = true;
    if (session !== null)
      delCha.forEach(cha => {
        flag =
          flag &&
          session.some(
            chaindeletSession => chaindeletSession.entity === cha[2]
          );
      });
    if (flag)
      for (let [start, end, name] of delCha) {
        this.addSession(
          [{ start: start, end: end, entity: name }],
          delLoationname
        );
      }
    //如果不是全都在一起,从del里面找到前一个session然后给他续上，如果找不到怎么办，试试续到后面，都没有就addsession
    else
      for (let [start, end, name] of delCha) {
        let startSession = nametime2Session(name, start),
          endSession = nametime2Session(name, end);
        if (startSession !== null) {
          let cha = startSession.find(cha => cha.entity === name);
          cha.end = end;
        } else if (endSession !== null) {
          let cha = endSession.find(cha => cha.entity === name);
          cha.start = start;
        } else {
          this.addSession(
            [{ start: start, end: end, entity: name }],
            delLoationname
          );
        }
      }

    function nametime2Session(name, time) {
      for (let [_, session] of sessionTable) {
        if (
          session.some(
            cha => cha.entity === name && time <= cha.end && time >= cha.start
          )
        )
          return session;
      }
      return null;
    }
  }


cutSession(characterName,time){
  let locationTree=this.data.locationTree.children;
  let sessionTable=this.data.sessionTable;
  if (sessionTable.size===0) return;
  let id,sessiontoCut,newId=0;
  for (let [_,session] of sessionTable){
    if (session.find(x=>x.start<time&&x.end>time&&x.entity===characterName)!==undefined){
      id=_;
      sessiontoCut=session;
    }
    newId=(newId>_)?newId:_+1;
  }
  let newSession=[];
  if (sessiontoCut ===undefined) return;
  for (let character of sessiontoCut){
    if (character.start<time&&character.end>time){
      newSession.push({
        start:time,
        end:character.end,
        entity:character.entity
      });
      character.end=time;
    }
  }
  sessionTable.set(newId,newSession);
  for (let location of locationTree){
    if (location.sessions.includes(id)){
      location.sessions.push(newId);
      break;
    }
  }
  return
}

}