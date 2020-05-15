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
        let start = span.getAttribute("Start");
        let end = span.getAttribute("End");
        story._timeStamps.push(start, end);
      }
    }
    const timeset = new Set(story._timeStamps);
    story._timeStamps = Array.from(timeset);
    story._timeStamps.sort();
    let sessionTable = story._tableMap.get("sessionTable");
    let timeTable = story._tableMap.get("timeTable");
    let locationTable = story._tableMap.get("locationTable");
    for (let table of [sessionTable, timeTable, locationTable]) {
      table.resize(story._characters.length, story._timeStamps.length);
    }
    for (let character of characters) {
      let spans = character.querySelectorAll("Span");
      let characterName = character.getAttribute("Name");
      let characterId = story._characters.indexOf(characterName);
      for (let span of spans) {
        let start = span.getAttribute("Start");
        let timeId = story._timeStamps.indexOf(start);
        timeTable.replace(characterId, timeId, 1);
        let sessionId = span.getAttribute("Session");
        sessionId = parseInt(sessionId);
        sessionTable.replace(characterId, timeId, sessionId);
      }
    }
    //parse the location part
    let locations = storyNode.querySelector("Locations");
    locations = storyNode.querySelectorAll("Location");
    for (let location of locations) {
      let locationTable = story._tableMap.get("locationTable");
      let sessionTable = story._tableMap.get("sessionTable");
      let timeTable = story._tableMap.get("timeTable");
      let locationName = location.getAttribute("Name");
      story._locations.push(locationName);
      const locationId = story._locations.length - 1;
      let sessionsInthislocation = location.getAttribute("Sessions").split(",");
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
  } else {
    console.warn("No story can be found through this url!");
  }
}

export function parseJSONFile(json, story) {}

export function dumpXMLFile(url, story) {}

export function dumpJSONFile(url, story) {}
