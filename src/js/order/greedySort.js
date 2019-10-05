const MAX_SORT_LOOP = 2;
let CharacterOrder = [];
let order;
let storydata;

function preprocessData(data) {
  // console.log(data);
  // use set to remove duplicate
  let entities = new Set(),
    keyTimeframe = new Set(),
    maxTimeframeTable = new Map();
  for (let [sessionId, entityInfoArray] of data.sessionTable) {
    entityInfoArray.forEach(entityInfo => {
      let entity = entityInfo.entity;
      if (!entities.has(entity)) {
        entities.add(entity);
        maxTimeframeTable.set(entity, Number.MIN_SAFE_INTEGER);
      }
      keyTimeframe.add(entityInfo.start);
      keyTimeframe.add(entityInfo.end);
      if (entityInfo.end > maxTimeframeTable.get(entity))
        maxTimeframeTable.set(entity, entityInfo.end);
    });
  }
  data.entities = [...entities];
  data.keyTimeframe = [...keyTimeframe].sort((a, b) => a - b);
  data.maxTimeframeTable = maxTimeframeTable;
}

function sortLocationTree(locationTree) {
  // recursion exit
  // current is undefined or has no child
  if (locationTree === undefined || !hasChildren(locationTree)) {
    return;
  }
  // dfs sorting
  // if has children

  for (let child of locationTree.children) {
    sortLocationTree(child);
  }

  locationTree.children = sortLocationChildren(locationTree);

  // locationTree here must have children
  // sort in same level
}
function sortLocationChildren(locationTree) {
  if (locationTree === undefined || !hasChildren(locationTree)) {
    // earse empty array
    return undefined;
  }
  calculateTotalEntityNum(locationTree, false);
  let children = locationTree.children;
  children.sort((a, b) => b.entities.size - a.entities.size);
  let result = [];
  result.push(children[0]);
  children.shift();
  for (let child of children) {
    // let initial big enough
    let minCrossing = Number.MAX_SAFE_INTEGER;
    let targetIndex = 0;
    for (let i = 0; i <= result.length; i++) {
      let crossing = calculateCrossings(result, child, i);
      // If there is more than one position that introduces the same crossing number,
      // we select the top one.
      if (crossing < minCrossing) {
        minCrossing = crossing;
        targetIndex = i;
      }
    }
    // insert at targetIndex
    result.splice(targetIndex, 0, child);
  }
  return result;
}

// Each tree node
// represents a location and includes all the session IDs that occur at the
// location.
// including children's
// SessionId -> time span and entity
// this function add a set of entities
function calculateTotalEntityNum(locationTree, forced) {
  let sessionTable = storydata.sessionTable;
  // already calculated and not forced to update
  if (locationTree.entities && !forced) {
    return locationTree.entities.length;
  }
  let result = new Set();
  if (hasChildren(locationTree)) {
    // non-leaf add their chilren's entities
    for (let child of locationTree.children) {
      calculateTotalEntityNum(child, forced);
      for (let entity of child.entities) {
        result.add(entity);
      }
    }
  }
  for (let sessionId of locationTree.sessions) {
    let entitiesInfo = sessionTable.get(sessionId);
    if (entitiesInfo === undefined) {
      // location tree may contain sessions where no entity is there
      entitiesInfo = [];
      sessionTable.set(sessionId, entitiesInfo);
    }
    for (let info of entitiesInfo) {
      result.add(info.entity);
    }
  }
  locationTree.entities = result;
  return result.size;
}

function hasChildren(_) {
  return !(!Array.isArray(_.children) || _.children.length === 0);
}

// at this stage all entities in locations are in a set
// ignore time span of session because they are almost identical
// calculate the minimal crossings
function calculateCrossings(tempResult, location, index) {
  let crossings = 0;
  // crossings above
  // pretend location is at index
  for (let i = index - 1; i >= 0; i--) {
    let locationAbove = tempResult[i];
    locationAbove.entityIntersectionNum = new Set(
      [...location.entities].filter(x => locationAbove.entities.has(x))
    ).size;
    let middleCrossings = 0;
    for (let j = index - 1; j > i; j--) {
      // these lines which don't winding to location will cause crossing
      //
      let locationInMiddle = tempResult[j];
      middleCrossings +=
        locationInMiddle.entities.size - locationInMiddle.entityIntersectionNum;
    }
    // each of intersect entity will cause a crossing
    middleCrossings *= locationAbove.entityIntersectionNum;
    crossings += middleCrossings;
  }

  // pretend location is at index - 1
  for (let i = index; i <= tempResult.length - 1; i++) {
    let locationBelow = tempResult[i];
    locationBelow.entityIntersectionNum = new Set(
      [...location.entities].filter(x => locationBelow.entities.has(x))
    ).size;
    let middleCrossings = 0;
    for (let j = index; j < i; j++) {
      let locationInMiddle = tempResult[j];
      middleCrossings +=
        locationInMiddle.entities.size - locationInMiddle.entityIntersectionNum;
    }

    middleCrossings *= locationBelow.entityIntersectionNum;
    crossings += middleCrossings;
  }
  return crossings;
}

function constructRelationshipTreeSequence() {
  let sequence = [];
  // not necessary to build all timeframe
  // just build at timeframe when change happens
  for (let timeframe of storydata.keyTimeframe) {
    sequence.push([timeframe, buildSingleRelationshipTree(timeframe)]);
  }
  return sequence;
}

function buildSingleRelationshipTree(timeframe) {
  return deepCopyLocationTree(storydata.locationTree, timeframe);
}

function deepCopyLocationTree(sourceTree, timeframe) {
  if (sourceTree === undefined) {
    return undefined;
  }
  let targetTree = Object.assign({}, sourceTree);
  // relationship tree node structure :
  // locationNode(already sorted by location tree) || => [sessions at this time] => [entities at this time]
  // entities and sessions are filtered by timeframe
  targetTree.sessions = sourceTree.sessions.slice();
  // unnecessary in relationship tree
  delete targetTree.entities;
  let sessionToEntities = new Map();
  targetTree.sessions //在这里哦，这里要注意顺序哦！！！！！！！！！！！！！！！
    .map(session => {
      let infoList = storydata.sessionTable.get(session);
      if (!infoList) {
        return { key: session, value: [] };
      }
      // [start, end) except for maxTimeframe
      // because the data is  like {start: 0, end: 7}, {start: 7, end: 21}
      // second condition is for the last session in this entity
      let ret = infoList.filter(
        info =>
          (info.start <= timeframe && timeframe < info.end) ||
          (timeframe === storydata.maxTimeframeTable.get(info.entity) &&
            timeframe === info.end)
      );
      return {
        key: session,
        value: ret
      };
    })
    .filter(session => session.value.length !== 0)
    .forEach(entry => sessionToEntities.set(entry.key, entry.value));
  targetTree.sessions = sessionToEntities;

  if (hasChildren(sourceTree)) {
    let tempChildren = [];
    // keep the location tree order here!
    for (let child of sourceTree.children) {
      tempChildren.push(deepCopyLocationTree(child, timeframe));
    }
    targetTree.children = tempChildren;
  }
  return targetTree;
}

function sortRelationTreeSequence(sequence) {
  for (let i = 0; i < MAX_SORT_LOOP / 2; i++) {
    let referenceTree;
    for (let j = 0; j < sequence.length; j++) {
      // sequence is [[timeframe, rtree]]
      let [_, rtree] = sequence[j];
      if (referenceTree === undefined) {
        referenceTree = rtree;
        // use initial as reference
        rtree.order = getEntitiesOrder(rtree);
        continue;
      }
      sortRelationTreeByReference(referenceTree, rtree);
      // update reference frame
      referenceTree = rtree;
    }
    // sweep from the last but 2 rtree
    for (let j = sequence.length - 2; j >= 0; j--) {
      let [_, rtree] = sequence[j];
      sortRelationTreeByReference(referenceTree, rtree);
      referenceTree = rtree;
    }
  }
}

// calculate entity weights and those of their sessions as reference frame
// weights of sessions are average of their entities
function getEntitiesOrder(relationshipTree) {
  let order = 0;

  // use map to get O(1) access
  // comparing to arrat.prorotype.indexOf() is O(n)
  let result = new Map();
  calculateWeights(relationshipTree);
  return result;

  function calculateWeights(relationshipTree) {
    // post-order
    if (hasChildren(relationshipTree)) {
      for (let child of relationshipTree.children) calculateWeights(child);
    }
    // map still preserve input order
    for (let [_, entitiesInfoArray] of relationshipTree.sessions) {
      for (let entitiesInfo of entitiesInfoArray) {
        // assign to each entity
        result.set(entitiesInfo.entity, order);
        order += 1;
      }
    }
  }
}

function entitysort(a, b) {
  let weightOfA = order.get(a.entity);
  let weightOfB = order.get(b.entity);
  // push eneities not in reference frame in back
  if (weightOfA === undefined && weightOfB === undefined) {
    return 0;
  }
  if (weightOfA === undefined) {
    return 1;
  }
  if (weightOfB === undefined) {
    return -1;
  }
  return weightOfA - weightOfB;
}

function sortSingleRelationTree(target) {
  if (target === undefined) {
    return;
  }
  // post-order dfs
  if (hasChildren(target)) {
    for (let child of target.children) {
      sortSingleRelationTree(child);
    }
  }
  let sessionWeights = new Map();
  for (let [sessionId, entityInfoArray] of target.sessions) {
    let validWeight = 0;
    let validNum = 0;
    // sort within a session (second level)
    entityInfoArray.sort(entitysort);

    let CharaInfoArray = entityInfoArray.map(x => x.entity);

    for (let [firstCha, lastCha] of CharacterOrder) {
      if (
        CharaInfoArray.indexOf(firstCha) !== -1 &&
        CharaInfoArray.indexOf(lastCha) !== -1 &&
        order.get(lastCha) < order.get(firstCha)
      ) {
        let avgWeight = (order.get(firstCha) + order.get(lastCha)) / 2;
        order.set(firstCha, avgWeight - 0.1);
        order.set(lastCha, avgWeight + 0.1);
      }
    }

    entityInfoArray.sort(entitysort);

    entityInfoArray.forEach(entityInfo => {
      let weight = order.get(entityInfo.entity);
      if (weight) {
        validWeight += weight;
        validNum += 1;
      }
    });

    let weightOfSession = Number.MAX_SAFE_INTEGER;
    if (validNum !== 0) {
      // all entities in this session is not in reference frame, push it to back
      weightOfSession = validWeight / validNum;
    }
    sessionWeights.set(sessionId, weightOfSession);
  }
  // sort sessions
  target.sessions = new Map(
    [...target.sessions].sort(
      (a, b) =>
        // a[0] is key of entry
        sessionWeights.get(a[0]) - sessionWeights.get(b[0])
    )
  );

  for (let [firstCha, lastCha] of CharacterOrder) {
    let firstId = findentity(firstCha);
    let lastId = findentity(lastCha);
    // debugger
    if (
      firstId !== lastId &&
      firstId !== -1 &&
      lastId !== -1 &&
      sessionWeights.get(lastId) <= sessionWeights.get(firstId)
    ) {
      let avgWeight =
        (sessionWeights.get(lastId) + sessionWeights.get(firstId)) / 2;
      sessionWeights.set(firstId, avgWeight - 0.1);
      sessionWeights.set(lastId, avgWeight + 0.1);
    }
  }

  target.sessions = new Map(
    [...target.sessions].sort(
      (a, b) =>
        // a[0] is key of entry
        sessionWeights.get(a[0]) - sessionWeights.get(b[0])
    )
  );

  function findentity(entityName) {
    for (let [sessionId, entityInfoArr] of target.sessions) {
      for (let entityInfo of entityInfoArr) {
        if (entityInfo.entity === entityName) return sessionId;
      }
    }
    return -1;
  }
}

function sortRelationTreeByReference(referenceTree, rtree) {
  order = referenceTree.order;
  sortSingleRelationTree(rtree);
  // update order after sorting
  rtree.order = getEntitiesOrder(rtree);
}

export function greedySort(data, orderInfo) {
  CharacterOrder = orderInfo;
  storydata = data;
  //entity keyTimeframe maxTimeframeTable
  preprocessData(data);
  sortLocationTree(data.locationTree);

  let sequence = constructRelationshipTreeSequence();

  sortRelationTreeSequence(sequence);
  // noinspection JSAnnotator
  function session2Loction(sessionId) {
    let ans;
    let locationTree = data.locationTree.children;
    locationTree.forEach(location => {
      if (location.sessions.indexOf(sessionId) !== -1) ans = location;
    });
    return ans;
  }
  // noinspection JSAnnotator
  function cha2Session(cha, time) {
    let sessionTable = data.sessionTable;
    for (let [SessionId, entityInfo] of sessionTable) {
      for (let character of entityInfo) {
        if (
          character.entity === cha &&
          time >= character.start &&
          time < character.end
        ) {
          return SessionId;
        }
      }
    }
  }

  for (let timeframe of sequence) {
    let inSessionPair = new Map(),
      betweenSessionPair = new Map(),
      betweenLocationPair = new Map();
    CharacterOrder.forEach(orderPair => {
      if (orderPair.length === 2) {
        orderPair = [...orderPair, Number.MIN_VALUE, Number.MAX_SAFE_INTEGER];
      }
      let beginTime = orderPair[2];
      let endTime = orderPair[3];
      let firstCha = orderPair[0];
      let lastCha = orderPair[1];
      if (!(timeframe[0] >= beginTime && timeframe[0] < endTime)) return;
      //接下来分类讨论到底是Location不同还是Session之间还是session之内
      //交换Location顺序，交换Session顺序，交换sessionTable内的顺序
      //光交换不行，把东西存到三个数组，然后排序才行。
      let firstSessionId = cha2Session(firstCha, timeframe[0]);
      let lastSessionId = cha2Session(lastCha, timeframe[0]);
      if (firstSessionId === undefined || lastSessionId === undefined)
        return;
      if (firstSessionId === lastSessionId) {
        let session = data.sessionTable.get(firstSessionId);
        let firstOrder = session.map(x => x.entity).indexOf(firstCha),
          lastOrder = session.map(x => x.entity).indexOf(lastCha);
        // if (firstOrder > lastOrder) {
        {
          // let temp=session[firstOrder];
          // session[firstOrder]=session[lastOrder];
          // session[lastOrder]=temp;
          let sessionOrder = inSessionPair.get(session);
          if (sessionOrder === undefined)
            inSessionPair.set(session, [[session[firstOrder], session[lastOrder]]]);
          else
            inSessionPair.set(
              session,
              [...sessionOrder,[session[firstOrder], session[lastOrder]]]
            );
        }
        return;
      }
      let firstLocation = session2Loction(firstSessionId),
        lastLocation = session2Loction(lastSessionId);
      if (firstLocation===undefined||lastLocation===undefined) return;
      if (firstLocation === lastLocation) {
        let time = timeframe[0];
        let locations = timeframe[1].children;
        let location = locations.find(x => x.name === firstLocation.name);
        let sessions = location.sessions;
        let indexofFirst = 0,
          indexofLast = 0;
        for (let [_, session] of sessions) {
          if (session.find(x => x.entity === firstCha) !== undefined) {
            indexofFirst = _;
            break;
          }
        }
        for (let [_, session] of sessions) {
          if (session.find(x => x.entity === lastCha) !== undefined) {
            indexofLast = _;
            break;
          }
        }
        let firstSession = sessions.get(indexofFirst);
        let lastSession = sessions.get(indexofLast);
        // sessions.delete(indexofFirst);
        // sessions.delete(indexofLast);
        // sessions.set(indexofFirst,firstSession);
        // sessions.set(indexofLast,lastSession);
        let sessionsOrder = betweenSessionPair.get(sessions);
        if (sessionsOrder === undefined)
          betweenSessionPair.set(sessions, [[indexofFirst, indexofLast]]);
        else
          betweenSessionPair.set(
            sessions,
            [...sessionsOrder,[indexofFirst, indexofLast]]
          );
        return;
      } else {
        let locations = timeframe[1].children;
        let firstLocationtoAdjust, lastLocationtoAdjust;
        firstLocationtoAdjust = locations.find(
          x => x.name === firstLocation.name
        );
        lastLocationtoAdjust = locations.find(
          x => x.name === lastLocation.name
        );
        let firstOrder = locations.indexOf(firstLocationtoAdjust);
        let lastOrder = locations.indexOf(lastLocationtoAdjust);
        // if (firstOrder > lastOrder) {
        {
          // let temp=locations[firstOrder];
          // locations[firstOrder]=locations[lastOrder];
          // locations[lastOrder]=temp;
          let LocationOrder = betweenLocationPair.get(locations);
          if (LocationOrder === undefined)
            betweenLocationPair.set(locations, [[locations[firstOrder], locations[lastOrder]]]);
          else
            betweenLocationPair.set(
              locations,
              [...LocationOrder,[locations[firstOrder], locations[lastOrder]]]
            );
        }
      }
    });
    let Locations=timeframe[1].children;
    if (Locations!==undefined){
      let order=betweenLocationPair.get(Locations);
      if (order!==undefined){
        // order=order.map(x=>Locations[x]);
        Locations.sort((a,b)=>{
          let locationOrder=order.find(x=>x.includes(a)&&x.includes(b));
          if (locationOrder===undefined) return 0;
          if (locationOrder[0]===a) return -1;
          return 1;
        });
      }
      for (let location of Locations){
        let sessions=location.sessions;
        let order=betweenSessionPair.get(sessions);
        let allsession=new Array(...sessions);
        if (order!==undefined)
          allsession.sort((a,b)=>{
            let sessionOrder=order.find(x=>x.includes(a[0])&&x.includes(b[0]));
            if (sessionOrder===undefined) return 0;
            if (sessionOrder[0]===a[0]) return -1;
            return 1;
          });
        location.sessions=new Map(allsession);
        for (let [_,session] of sessions){
          let order=inSessionPair.get(session);
          if (order===undefined) continue;
          // order.map(x=>sess)
          session.sort((a,b)=>{
            let chaOrder=order.find(x=>x.includes(a)&&x.includes(b));
            if (chaOrder===undefined) return 0;
            if (chaOrder[0]===a) return -1;
            return 1;
          })
        }

      }

    }

  }
  return sequence;
}

