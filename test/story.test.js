import { expect } from "chai";
import { Story } from "../src/js/data/story";

describe("Story.js", () => {
  let story;

  describe("props", () => {
    beforeEach(() => {
      story = new Story();
    });
    it("props correct when a story object is constructed", () => {
      const characterTable = story.getTable("character");
      const locationTable = story.getTable("location");
      const sessionTable = story.getTable("session");
      expect(characterTable.rows).to.equal(0);
      expect(locationTable.rows).to.equal(0);
      expect(sessionTable.rows).to.equal(0);
    });
  });

  describe("methods", () => {
    describe("#addCharacter", () => {
      beforeEach(() => {
        story.addCharacter("T1", [[1, 10]]);
        story.addCharacter("T2", [[1, 5], [7, 22]]);
        story.addCharacter("T3", [[7, 30], [65, 80]]);
        story.addCharacter("T4", [[1, 10]]);
        story.addCharacter("T5", [[1, 5], [7, 22]]);
      });
      it("characters are appended successfully", () => {
        expect(story.getTableRows()).to.equal(5);
        expect(story.getTableCols()).to.equal(7);
      });
    });
    describe("#deleteCharacter", () => {
      beforeEach(() => {
        story.deleteCharacter("T4");
        story.deleteCharacter(3);
      });
      it("characters are deleted successfully", () => {
        expect(story.getTableRows()).to.equal(3);
        expect(story.getTableCols()).to.equal(7);
      });
    });
    describe("#changeCharacter", () => {
      beforeEach(() => {
        story.changeCharacter("T3", [[1, 5], [7, 22]]);
      });
      it("characters are changed successfully", () => {
        expect(story.getTableRows()).to.equal(3);
        expect(story.getTableCols()).to.equal(4);
      });
    });
    describe("#changeSession", () => {
      beforeEach(() => {
        const newSessionID = story.getNewSessionID();
        story.changeSession(newSessionID, [0, 1], [3, 9]);
      });
      it("sessions are changed successfully", () => {
        const sessionTable = story.getTable("session");
        expect(sessionTable.value(0, 0)).to.equal(3);
        expect(sessionTable.value(1, 2)).to.equal(3);
      });
    });
    describe("#changeLocation", () => {
      beforeEach(() => {
        story.changeLocation("ZJU", [1]);
        story.changeLocation("HZ", [2, 3]);
      });
      it("locations are changed successfully", () => {
        const locations = story.locations;
        const locationTable = story.getTable("location");
        expect(locations[0]).to.equal("All");
        expect(locations[1]).to.equal("ZJU");
        expect(locations[2]).to.equal("HZ");
        expect(locationTable.value(0, 0)).to.equal(2);
        expect(locationTable.value(1, 0)).to.equal(2);
        expect(locationTable.value(1, 1)).to.equal(2);
        expect(locationTable.value(1, 3)).to.equal(1);
        expect(locationTable.value(2, 1)).to.equal(0);
      });
    });
    describe("#characters", () => {
      it("characters are correct", () => {
        const ID1 = story.getCharacterID("T1");
        const name1 = story.getCharacterName(ID1);
        const timeRange1 = story.getCharacterTimeRange(name1);
        const ID4 = story.getCharacterID("T4");
        const name4 = story.getCharacterName(3);
        const ID5 = story.getCharacterID("T5");
        const timeRange5 = story.getCharacterTimeRange("T5");
        expect(ID1).to.equal(0);
        expect(name1).to.equal("T1");
        expect(timeRange1.length).to.equal(3);
        expect(ID4).to.equal(null);
        expect(name4).to.equal(null);
        expect(ID5).to.equal(null);
        expect(timeRange5.length).to.equal(0);
      });
    });
    describe("#sessions", () => {
      it("sessions are correct", () => {
        const session1 = story.getSessionID(3, "T1");
        const newSessionID = story.getNewSessionID();
        expect(session1).to.equal(3);
        expect(newSessionID).to.equal(4);
        const characters = story.getSessionCharacters(session1);
        expect(characters.length).to.equal(2);
        expect(characters[0]).to.equal(0);
        expect(characters[1]).to.equal(1);
        const timeRange = story.getSessionTimeRange(session1);
        expect(timeRange.length).to.equal(3);
      });
    });
    describe("#locations", () => {
      it("locations are correct", () => {
        const characters = story.getLocationCharacters("HZ");
        const sessions = story.getLocationSessions("ZJU");
        expect(characters.length).to.equal(3);
        expect(characters[0]).to.equal(0);
        expect(characters[1]).to.equal(1);
        expect(sessions.length).to.equal(1);
        expect(sessions[0]).to.equal(1);
      });
    });
  });
});
