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
        story.addCharacter("Test1", [[1, 10], [20, 30]]);
      });
      it("characters are appended successfully", () => {
        expect(story.characters.length).to.equal(1);
      });
    });
    // describe("#changeCharacter", () => {
    //   beforeEach(() => {
    //     story.addCharacter("Test1", [[1, 10], [20, 30]]);
    //     story.changeCharacter(1, [[20, 30]]);
    //   });
    //   it("sessions are deactivated successfully", () => {
    //     const characterTable = story._tableMap.get("character");
    //     expect(characterTable.value(0, 2)).to.equal(0);
    //   });
    // });
    // describe("#deleteCharacter", () => {
    //   beforeEach(() => {
    //     story.addCharacter("Test1", [[1, 10], [20, 30]]);
    //     story.addCharacter("Test2", [[2, 30]]);
    //     story.deleteCharacter("Test1");
    //   });
    //   it("character is deleted successfully", () => {
    //     expect(story.getCharacterID("Test1")).to.equal(null);
    //     expect(story.characters.length).to.equal(1);
    //   });
    // });
    // describe("#changeSession", () => {
    //   beforeEach(() => {
    //     story.addCharacter("Test1", [[1, 10], [20, 30]]);
    //     story.addCharacter("Test2", [[3, 40]]);
    //     story.changeSession(100, ["Test1", "Test2"], [20, 25]);
    //     story.changeSession(200, ["Test2"], [30, 40]);
    //   });
    //   it("sessions are changed", () => {
    //     const timeSpan = story.getSessionTimeRange(1);
    //     expect(timeSpan[1]).to.equal(30);
    //   });
    // });
    // describe("#changeLocation", () => {
    //   beforeEach(() => {
    //     story.addCharacter("Test1", [[1, 10], [20, 30]]);
    //     story.addCharacter("Test2", [[3, 40]]);
    //     story.changeLocation("hangzhou", [0, 1], [[1, 10]]);
    //     story.changeLocation("zju", [0], [[20, 30]]);
    //   });
    //   it("locations are changed", () => {
    //     const locationTable = this._tableMap.get("location");
    //     const locationID1 = locationTable.value(1, 1);
    //     const locationID2 = locationTable.value(0, 3);
    //     expect(story.location[locationID1]).to.equal("hangzhou");
    //     expect(story.location[locationID2]).to.equal("zju");
    //   });
    // });
  });
});
