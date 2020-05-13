/**
 * @types
 * Visual Space
 *  - Node: (x, y)
 *  - NodeID: Number
 *  - Segment: Node[]
 *  - SegmentID: Number
 *  - SegmentPath: String
 *  - Storyline: Segment[]
 *  - StorylinePath: SegmentPath[]
 * Story Space
 *  - CharacterName: String
 *  - CharacterID: Number
 *  - Time: Number
 *  - TimeStep: Number
 *  - TimeSpan: [t1, t2]
 *  - TimeRange: TimeSpan[]
 *  - LocationID: Number
 *  - LocationName: String
 */
export class Graph {
  constructor(story) {
    this._story = story;
  }

  /**
   * Get the character ID according to the given position.
   *
   * @param { Number } x
   * @param { Number } y
   *
   * @return characterID
   */
  getCharacterID(x, y) {}

  /**
   * Get the character name according to the given position.
   *
   * @param { Number } x
   * @param { Number } y
   *
   * @return characterName
   */
  getCharacterName(x, y) {}

  /**
   * Get the location ID according to the given position.
   *
   * @param { Number } x
   * @param { Number } y
   *
   * @return locationID
   */
  getLocationID(x, y) {}

  /**
   * Get the location name according to the given position.
   *
   * @param { Number } x
   * @param { Number } y
   *
   * @return locationName
   */
  getLocationName(x, y) {}

  /**
   * Get the timeStep according to the given position.
   *
   * @param { Number } x
   * @param { Number } y
   *
   * @return timeStep
   */
  getTimeStep(x, y) {}

  /**
   * Get the timeSpan according to the given position.
   *
   * @param { Number } x
   * @param { Number } y
   *
   * @return timeStep
   */
  getTimeSpan(x, y) {}

  /**
   * Get the x pos of the specified character at a given time.
   *
   * @param { String | Number } character
   * @param { Number } timeStep
   *
   * @return X
   */
  getCharacterX(character, timeStep) {}

  /**
   * Get the y pos of the specified character at a given time.
   *
   * @param { String | Number } character
   * @param { Number } timeStep
   *
   * @return Y
   */
  getCharacterY(character, timeStep) {}

  /**
   * Get the segment of the specified character at a given time.
   *
   * @param { String | Number } character
   * @param { Number } timeStep
   *
   * @return segment
   */
  getSegment(character, timeStep) {}

  /**
   * Get the storyline of the specified character at a given time.
   *
   * @param { String | Number } character
   * @param { Number } timeStep
   *
   * @return segment[]
   */
  getStoryline(character, timeStep) {}

  /**
   * Get the segment path of the specified character at a given time.
   *
   * @param { String | Number } character
   * @param { Number } timeStep
   *
   * @return segmentPath
   */
  getSegmentPath(character, timeStep) {}

  /**
   * Get the storyline path of the specified character at a given time.
   *
   * @param { String | Number } character
   * @param { Number } timeStep
   *
   * @return segmentPath[]
   */
  getStorylinePath(character, timeStep) {}
}
