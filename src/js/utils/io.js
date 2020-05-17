import { cos } from "snapsvg";

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

export function parseJSONFile(json, story) {}

export function dumpXMLFile(fileName, story) {
  if (fileName.indexOf(".xml") == -1) fileName += ".xml ";
}

export function dumpJSONFile(fileName, story) {
  if (fileName.indexOf(".json") == -1) fileName += ".json";
  let locationsJson = dumpJsonLocation(story);
  let charactersJson = dumpJsonCharacters(story);
  let storyJson = {
    Story: { Locations: locationsJson, Characters: charactersJson }
  };
  downloadFile(fileName, JSON.stringify(storyJson));
}

function dumpJsonLocation(story) {
  let locationsJson = [];
  console.log(story);
  let locations = story._locations;
  debugger;
  for (let location of locations) {
    console.log(location);
  }
  return locationsJson;
}

function dumpJsonCharacters(story) {
  return [];
}

function downloadFile(fileName, content) {
  let aLink = document.createElement("a");
  let blob = new Blob([content]);
  aLink.download = fileName;
  aLink.style.display = "none";
  aLink.href = URL.createObjectURL(blob);
  document.body.appendChild(aLink);
  // aLink.click();
  console.log(content);
  document.body.removeChild(aLink);
}
