export function hitTest(graph, x0, y0, width, height) {
  // grid test
  const grid = gridSearch(x0, y0, width, height);
  console.log("=========TEST TIMESPAN=========");
  grid.forEach(pair =>
    console.log(pair, graph.getStoryTimeSpan(pair[0], pair[1]))
  );
}

function gridSearch(x0, y0, width, height, step = 10) {
  let grid = [];
  // grid test
  for (let x = x0 + 1; x < x0 + width; x += step) {
    for (let y = y0 + 1; y < y0 + height; y += step) {
      grid.push([x, y]);
    }
  }
  return grid;
}
