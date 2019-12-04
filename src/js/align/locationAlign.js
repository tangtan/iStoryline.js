export function locationAlign(sequence) {
  const { _sessionToLocation, _locationIndex } = _getSessionToLocation(
    sequence.locationTree
  );
  let _alignedSessions = _calculateAlignedSessions(
    sequence.sequence,
    sequence.order,
    _sessionToLocation,
    _locationIndex
  );
  let locationAlignAns = sequence;
  locationAlignAns.alignedSessions = _alignedSessions;
  return locationAlignAns;
}
function _calculateAlignedSessions(
  _sequence,
  _order,
  _sessionToLocation,
  _locationIndex
) {
  let _maxLines = [];
  let _tmpLines = [];
  let _sumLines = [];
  let _ret = [];
  for (let i = 0; i < _order.length; i++) {
    _maxLines[i] = 0;
    _tmpLines[i] = 0;
  }
  for (let i = 0; i < _sequence.length; i++) {
    for (let j = 0; j < _order.length; j++) {
      _tmpLines[j] = 0;
    }
    if (_sequence[i] === undefined) continue;
    for (let j = 0; j < _sequence[i][1].length; j++) {
      let _id = _sequence[i][1][j][0];
      let _location = _sessionToLocation.get(_id);
      let _index = _locationIndex.get(_location);
      let _actualOrder = _order[_index];
      _tmpLines[_actualOrder] += _sequence[i][1][j][1].length;
      _maxLines[_actualOrder] = Math.max(
        _maxLines[_actualOrder],
        _tmpLines[_actualOrder]
      );
    }
  }
  for (let i = 0; i < _order.length; i++) {
    _sumLines[i] = _maxLines[i];
    if (i > 0) _sumLines[i] += _sumLines[i - 1];
  }
  for (let i = 0; i < _sequence.length; i++) {
    _ret[i] = new Array();
    if (_sequence[i] === undefined) continue;
    _ret[i][0] = _sequence[i][0];
    _ret[i][1] = new Map();
    for (let j = 0; j < _sequence[i][1].length; j++) {
      let _id = _sequence[i][1][j][0];
      let _location = _sessionToLocation.get(_id);
      let _index = _locationIndex.get(_location);
      let _actualOrder = _order[_index];
      _ret[i][1].set(j, {
        max: _maxLines[_actualOrder],
        sum: _sumLines[_actualOrder]
      });
    }
  }
  return _ret;
}
function _getSessionToLocation(_locationTree) {
  let _queue = [];
  let _sessionToLocation = new Map();
  let _locationIndex = new Map();
  let _head = 0,
    _tail = 0;
  _queue[++_tail] = _locationTree;
  while (_head ^ _tail) {
    ++_head;
    _locationIndex.set(_queue[_head].name, _head);
    for (let i = 0; i < _queue[_head].children.length; i++) {
      _queue[++_tail] = _queue[_head].children[i];
    }
    for (let i = 0; i < _queue[_head].sessions.length; i++) {
      _sessionToLocation.set(_queue[_head].sessions[i], _queue[_head].name);
    }
  }
  return { _sessionToLocation, _locationIndex };
}
