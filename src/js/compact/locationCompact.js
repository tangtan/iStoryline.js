export function locationCompact(
  alignAns,
  compressInfo,
  extendInfo,
  merge,
  split,
  din,
  dout
) {
  let initialNodes = _calculateInitialNodes(
    alignAns.entities,
    alignAns.sequence,
    alignAns.alignedSessions
  );
  let initialGraph = alignAns;
  initialGraph.initialNodes = initialNodes;
  return initialGraph;
}
function _calculateInitialNodes(
  _entities,
  _sequence,
  _alignedSessions,
  timespan = 50
) {
  let _cnt = [];
  let _ret = new Array();
  for (let i = 0; i < _entities.length; i++) {
    _cnt[i] = 0;
    _ret[i] = new Array();
  }
  for (let i = 0; i < _sequence.length; i++) {
    for (let j = 0; j < _sequence[i][1].length; j++) {
      for (let k = 0; k < _sequence[i][1][j][1].length; k++) {
        let _entity = _sequence[i][1][j][1][k];
        let _start = _entity.start;
        let _end = _entity.end;
        let _name = _entity.entity;
        let _id = _getNameId(_name, _entities);
        _ret[_id][_cnt[_id]] = new Array();
        _ret[_id][_cnt[_id]][0] = _start * timespan;
        let y = _calculateY(
          _alignedSessions[i][1].get(j),
          k,
          _sequence[i][1][j][1].length
        );
        _ret[_id][_cnt[_id]++][1] = y;
        _ret[_id][_cnt[_id]] = new Array();
        _ret[_id][_cnt[_id]][0] = _end * timespan - timespan / 2;
        _ret[_id][_cnt[_id]++][1] = y;
      }
    }
  }
  return _ret;
}
function _getNameId(_name, _entities) {
  for (let i = 0; i < _entities.length; i++) {
    if (_entities[i] === _name) {
      return i;
    }
  }
  return 0;
}
function _calculateY(_lineInfo, k, tot, lineSpace = 1000) {
  let _maxLine = _lineInfo.max;
  let _sumLine = _lineInfo.sum;
  let _before = _sumLine - _maxLine;
  let centerY = _before * lineSpace + (_maxLine * lineSpace) / 2;
  if (tot & 1) {
    return centerY + (k - Math.floor(tot / 2)) * lineSpace;
  } else {
    return centerY + (k - (tot - 1) * 0.5) * lineSpace;
  }
}
