export function locationSort(data, orderInfo) {
  let _names = data.entities;
  let _locationTree = data.locationTree;
  let _sessionTable = data.sessionTable;
  const { _sessionToLocation, _locationIndex } = _getSessionToLocation(
    _locationTree
  );
  let _locationTotal = _getMapLength(_locationIndex);
  let _valueMatrix = _getValueMatrix(
    _locationTotal,
    _sessionTable,
    _sessionToLocation,
    _locationIndex
  );
  const { _line, _biLine } = _getLine(_locationTotal, _valueMatrix);
  let _finalOrder = _calculateLocationOrder(_biLine, _locationTotal);
  let _sequence = _calculateSequence(data.keyTimeframe, _sessionTable);

  _sequence = _sortSequence(
    _sequence,
    _sessionToLocation,
    _locationIndex,
    _finalOrder
  );
  let locationSort = data;
  locationSort.sequence = _sequence;
  locationSort.order = _finalOrder;
  return locationSort;
}
function _sortSequence(_sequence, _sessionToLocation, _locationIndex, _order) {
  for (let i = 0; i < _sequence.length; i++) {
    if (_sequence[i] === undefined) continue;
    for (let j = 0; j < _sequence[i][1].length; j++) {
      let rec = j;
      for (let k = j + 1; k < _sequence[i][1].length; k++) {
        if (
          _getLocationOrderFromSession(
            _sequence[i][1][rec][0],
            _sessionToLocation,
            _locationIndex,
            _order
          ) >
          _getLocationOrderFromSession(
            _sequence[i][1][k][0],
            _sessionToLocation,
            _locationIndex,
            _order
          )
        ) {
          rec = k;
        }
      }
      _swap(_sequence[i][1], rec, j);
    }
  }
  return _sequence;
}
function _getMapLength(_map) {
  let _ret = 0;
  for (let k of _map) {
    _ret++;
  }
  return _ret;
}
function _getLocationOrderFromSession(
  sessionID,
  _sessionToLocation,
  _locationIndex,
  _order
) {
  let _name = _sessionToLocation.get(sessionID);
  let _number = _locationIndex.get(_name);
  let _ret = _order[_number];
  return _ret;
}
function _swap(_sequence, rec, j) {
  let tmp = _deepCopy(_sequence[rec]);
  _sequence[rec] = _sequence[j];
  _sequence[j] = tmp;
}
function _calculateSequence(_keyTimeframe, _sessionTable) {
  let _sequence = new Array();
  let _cnt = new Array();
  for (let i = 0; i < _keyTimeframe.length; i++) {
    _cnt[i] = 0;
  }
  for (let key of _sessionTable) {
    let _session = key[1];
    let _time = _session[0].start;
    let _index = _getIndexfromTimeframe(_keyTimeframe, _time);
    if (_sequence[_index] === undefined) {
      _sequence[_index] = new Array();
      _sequence[_index][0] = _time;
      _sequence[_index][1] = new Array();
    }
    _sequence[_index][1][_cnt[_index]] = new Array();
    _sequence[_index][1][_cnt[_index]][0] = key[0];
    _sequence[_index][1][_cnt[_index]][1] = _deepCopy(_session);
    _cnt[_index]++;
  }
  return _sequence;
}
function _deepCopy(tmp) {
  if (tmp instanceof Array) {
    let ret = new Array();
    for (let i = 0; i < tmp.length; i++) {
      ret[i] = _deepCopy(tmp[i]);
    }
    return ret;
  } else if (tmp instanceof Object) {
    let ret = new Object();
    for (let i in tmp) {
      ret[i] = _deepCopy(tmp[i]);
    }
    return ret;
  } else {
    return tmp;
  }
}
function _getIndexfromTimeframe(_keyTimeframe, _time) {
  let l = 0,
    r = _keyTimeframe.length - 1;
  let mid = 0,
    _ret = 0;
  while (l <= r) {
    mid = (l + r) >> 1;
    if (_keyTimeframe[mid] <= _time) {
      _ret = mid;
      l = mid + 1;
    } else {
      r = mid - 1;
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
    if (_head == 1) _queue[_head].name = "default";
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
function _getValueMatrix(
  _locationTotal,
  _sessionTable,
  _sessionToLocation,
  _locationIndex
) {
  let _valueMatrix = new Array();
  for (let i = 0; i <= _locationTotal; i++) {
    _valueMatrix[i] = new Array();
    for (let j = 0; j <= _locationTotal; j++) {
      _valueMatrix[i][j] = 0;
    }
  }
  for (let obu of _sessionTable) {
    for (let obv of _sessionTable) {
      if (obu[0] !== obv[0]) {
        let sessionsU = obu[1];
        let sessionsV = obv[1];
        for (let i = 0; i < sessionsU.length; i++) {
          for (let j = 0; j < sessionsV.length; j++) {
            if (
              sessionsU[i].entity === sessionsV[j].entity &&
              sessionsU[i].end === sessionsV[j].start
            ) {
              let locationU = _sessionToLocation.get(obu[0]);
              let locationV = _sessionToLocation.get(obv[0]);
              if (locationU !== locationV) {
                let indexU = _locationIndex.get(locationU);
                let indexV = _locationIndex.get(locationV);
                _valueMatrix[indexU][indexV]++;
              }
            }
          }
        }
      }
    }
  }
  return _valueMatrix;
}
function _getLine(_locationTotal, _valueMatrix) {
  let _line = new Array();
  let _biLine = new Array();
  let _lineCnt = 0;
  let _biLineCnt = 0;
  for (let i = 1; i <= _locationTotal; i++)
    for (let j = 1; j <= _locationTotal; j++)
      if (_valueMatrix[i][j] > 0) {
        if (j > i) {
          _biLine[_biLineCnt] = new Array();
          _biLine[_biLineCnt][0] = i;
          _biLine[_biLineCnt][1] = j;
          _biLine[_biLineCnt][2] = _valueMatrix[i][j] + _valueMatrix[j][i];
          _biLineCnt++;
        }
        _line[_lineCnt] = new Array();
        _line[_lineCnt][0] = i;
        _line[_lineCnt][1] = j;
        _line[_lineCnt][2] = _valueMatrix[i][j];
        ++_lineCnt;
      }
  _line.sort(_sortByWeight);
  _biLine.sort(_sortByWeight);
  return { _line, _biLine };
}
function _calculateLocationOrder(_biLine, _locationTotal) {
  let _biLineTotal = _biLine.length;
  let _degree = new Array();
  let _timeStamp = new Array();
  let _order = new Array();
  let _index = new Array();
  let _fa = new Array();
  let _next = new Array();
  let _cnt = new Array();
  _timeStamp[0] = 0;
  for (let i = 1; i <= _locationTotal; i++) {
    _degree[i] = 0;
    _fa[i] = i;
    _next[i] = new Array();
    _order[i] = 0;
    _cnt[i] = 0;
  }
  _fa[0] = 0;
  for (let i = 0; i < _biLineTotal; i++) {
    if (_checkChosen(_biLine[i][0], _biLine[i][1], _degree, _fa)) {
      _degree[_biLine[i][0]]++;
      _degree[_biLine[i][1]]++;
      _fa[_getfa(_biLine[i][0], _fa)] = _getfa(_biLine[i][1], _fa);
      _next[_biLine[i][0]][_cnt[_biLine[i][0]]++] = _biLine[i][1];
      _next[_biLine[i][1]][_cnt[_biLine[i][1]]++] = _biLine[i][0];
    }
  }
  for (let i = 1; i <= _locationTotal; i++) {
    if (_degree[i] <= 1) {
      _numberLocation(i, _next, _order, _timeStamp, _index);
    }
  }
  return _order;
}
function _numberLocation(x, next, order, cnt, _index) {
  if (order[x] !== 0) return;
  order[x] = ++cnt[0];
  _index[cnt[0]] = order[x];
  if (next[x].length > 0) {
    if (order[next[x][0]] === 0)
      _numberLocation(next[x][0], next, order, cnt, _index);
  }
  if (next[x].length > 1) {
    if (order[next[x][1]] === 0)
      _numberLocation(next[x][1], next, order, cnt, _index);
  }
}
function _getfa(x, fa) {
  if (fa[x] === x) return x;
  fa[x] = _getfa(fa[x], fa);
  return fa[x];
}
function _calculateBiLineCrossNumber(_lineOrder, _line) {
  let _ret = 0;
  let _lineTotal = _line.length;
  for (let i = 0; i < _lineTotal; i++) {
    for (let j = i + 1; j < _lineTotal; j++) {
      if (_checkCross(_lineOrder, _line, i, j)) {
        _ret += _line[i][2] * _line[j][2];
      }
    }
  }
  return _ret;
}
function _checkCross(_lineOrder, _line, i, j) {
  if (
    _lineOrder[_line[i][0]] < _lineOrder[_line[j][0]] &&
    _lineOrder[_line[i][1]] > _lineOrder[_line[j][1]]
  )
    return true;
  if (
    _lineOrder[_line[i][0]] > _lineOrder[_line[j][0]] &&
    _lineOrder[_line[i][1]] < _lineOrder[_line[j][1]]
  )
    return true;
  return false;
}
function _checkChosen(u, v, _degree, _fa) {
  if (_degree[u] > 1) return false;
  if (_degree[v] > 1) return false;
  if (_getfa(u, _fa) === _getfa(v, _fa)) return false;
  return true;
}
function _sortByWeight(x, y) {
  return y[2] - x[2];
}
