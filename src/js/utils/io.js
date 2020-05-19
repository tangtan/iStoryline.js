export function parseXMLFile(xml, story) {
  let storyNode = xml.querySelector("Story");
  if (storyNode) {
    let characters = storyNode.querySelector("Characters");
    characters = characters.querySelectorAll("Character");
    for (let character of characters) {
      let name = character.getAttribute("Name");
      story._characters.push(name);
      let spans = character.querySelectorAll("Span");
      for (let span of spans) {
        let start = parseInt(span.getAttribute("Start"));
        let end = parseInt(span.getAttribute("End"));
        story._timeStamps.push(start, end);
      }
    }
    const timeset = new Set(story._timeStamps);
    story._timeStamps = Array.from(timeset);
    story._timeStamps.sort((a, b) => a - b);
    let sessionTable = story._tableMap.get("session");
    let characterTable = story._tableMap.get("character");
    let locationTable = story._tableMap.get("location");
    for (let table of [sessionTable, characterTable, locationTable]) {
      table.resize(story._characters.length, story._timeStamps.length);
    }
    for (let character of characters) {
      let spans = character.querySelectorAll("Span");
      let characterName = character.getAttribute("Name");
      let characterId = story._characters.indexOf(characterName);
      for (let span of spans) {
        let start = parseInt(span.getAttribute("Start"));
        let end = parseInt(span.getAttribute("End"));
        let timeId = story._timeStamps.indexOf(start);
        let timeIdend = story._timeStamps.indexOf(end);
        let sessionId = span.getAttribute("Session");
        sessionId = parseInt(sessionId);
        for (let id = timeId; id < timeIdend; id++) {
          characterTable.replace(characterId, id, 1);
          sessionTable.replace(characterId, id, sessionId);
        }
      }
    }
    //parse the location part
    let locations = storyNode.querySelector("Locations");
    locations = storyNode.querySelectorAll("Location");
    for (let location of locations) {
      let locationTable = story._tableMap.get("location");
      let sessionTable = story._tableMap.get("session");
      let characterTable = story._tableMap.get("character");
      let locationName = location.getAttribute("Name");
      story._locations.push(locationName);
      const locationId = story._locations.length - 1;
      let sessionsInthislocation = location.getAttribute("Sessions").split(",");
      sessionsInthislocation = sessionsInthislocation.map(x => parseInt(x));
      for (let i = 0; i < sessionTable.rows; i++)
        for (let j = 0; j < sessionTable.cols; j++) {
          let rightSession =
            sessionsInthislocation.indexOf(sessionTable.value(i, j)) !== -1;
          if (characterTable.value(i, j) === 1 && rightSession) {
            locationTable.replace(i, j, locationId);
          }
        }
    }
  } else {
    console.warn("No story can be found through this url!");
  }
}

export function parseJSONFile(json, story) {
  // let jsonObject=JSON.parse(json)
  let storyJson = json.Story;
  let locations = storyJson.Locations;
  let characters = storyJson.Characters;
  for (let character in characters) {
    let name = character;
    story._characters.push(name);
    let spans = characters[name];
    for (let span of spans) {
      let start = parseInt(span["Start"]);
      let end = parseInt(span["End"]);
      story._timeStamps.push(start, end);
    }
  }
  const timeset = new Set(story._timeStamps);
  story._timeStamps = Array.from(timeset);
  story._timeStamps.sort((a, b) => a - b);
  let sessionTable = story._tableMap.get("session");
  let characterTable = story._tableMap.get("character");
  let locationTable = story._tableMap.get("location");
  for (let table of [sessionTable, characterTable, locationTable]) {
    table.resize(story._characters.length, story._timeStamps.length);
  }
  for (let character in characters) {
    let characterName = character;
    let spans = characters[characterName];
    let characterId = story._characters.indexOf(characterName);
    for (let span of spans) {
      let start = parseInt(span["Start"]);
      let end = parseInt(span["End"]);
      let timeId = story._timeStamps.indexOf(start);
      let timeIdend = story._timeStamps.indexOf(end);
      let sessionId = span["Session"];
      sessionId = parseInt(sessionId);
      for (let id = timeId; id < timeIdend; id++) {
        characterTable.replace(characterId, id, 1);
        sessionTable.replace(characterId, id, sessionId);
      }
    }
  }
  //parse the location part
  for (let locationName in locations) {
    let location = locations[locationName];
    let locationTable = story._tableMap.get("location");
    let sessionTable = story._tableMap.get("session");
    let characterTable = story._tableMap.get("character");
    story._locations.push(locationName);
    const locationId = story._locations.length - 1;
    let sessionsInthislocation = location;
    sessionsInthislocation = sessionsInthislocation.map(x => parseInt(x));
    for (let i = 0; i < sessionTable.rows; i++)
      for (let j = 0; j < sessionTable.cols; j++) {
        let rightSession =
          sessionsInthislocation.indexOf(sessionTable.value(i, j)) !== -1;
        if (characterTable.value(i, j) === 1 && rightSession) {
          locationTable.replace(i, j, locationId);
        }
      }
  }
}

export function dumpXMLFile(fileName, story) {
  if (fileName.indexOf(".xml") == -1) fileName += ".xml ";
  const JSONFile = generateJSONFile(story);
  let builder = new xml2js.Builder();
  let xml = builder.buildObject(JSONFile);
  downloadFile(fileName, xml);
}

export function dumpJSONFile(fileName, story) {
  if (fileName.indexOf(".json") == -1) fileName += ".json";
  let storyJson = generateJSONFile(story);
  downloadFile(fileName, JSON.stringify(storyJson));
}

function generateJSONFile(story) {
  let locationsJson = dumpJsonLocation(story);
  let charactersJson = dumpJsonCharacters(story);
  let storyJson = {
    Story: { Locations: locationsJson, Characters: charactersJson }
  };
  return storyJson;
}

function dumpJsonLocation(story) {
  let locationsJson = {};
  let locations = story._locations;
  for (let location of locations) {
    let sessions = story.getLocationSessions(location);
    locationsJson[location] = sessions;
  }
  return locationsJson;
}

function dumpJsonCharacters(story) {
  let charactersJson = {};
  let characters = story._characters;
  for (let character of characters) {
    let timeStamps = story.getCharacterTimeRange(character);
    let spansJson = [];
    for (let timeStamp of timeStamps) {
      let [start, end] = timeStamp;
      let sessionId = story.getSessionID(start, character);
      let spanJson = { Start: start, End: end, Session: sessionId };
      spansJson.push(spanJson);
    }
    charactersJson[character] = spansJson;
  }
  return charactersJson;
}

function downloadFile(fileName, content) {
  let aLink = document.createElement("a");
  let blob = new Blob([content]);
  aLink.download = fileName;
  aLink.style.display = "none";
  aLink.href = URL.createObjectURL(blob);
  document.body.appendChild(aLink);
  aLink.click();
  document.body.removeChild(aLink);
}
