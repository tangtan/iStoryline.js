// input: dist(y), numOfClusters(x)
// output: L_cut
// find 2 linear models to fit the curve, with min rmse
function L_method(mergeResults) {
  let k = 1
  let minError = Number.MAX_VALUE
  const points = mergeResults
    .reverse()
    .map(obj => ({ x: obj.numOfClusters, y: obj.dist }))
  // console.log(points)
  const eq = linearRegression(points)
  // console.log(eq)
  for (let i = 2; i < points.length - 1; i++) {
    let l_points = points.slice(0, i)
    let r_points = points.slice(i, points.length)
    let l_eq = linearRegression(l_points)
    let r_eq = linearRegression(r_points)
    // console.log('left: ', l_eq)
    // console.log('right: ', r_eq)
    let l_error = rmse(l_points, l_eq)
    let r_error = rmse(r_points, r_eq)
    let error_tmp =
      (l_error * i) / points.length +
      (r_error * (points.length - i)) / points.length
    // console.log(i, 'error: ', error_tmp)
    if (error_tmp < minError) {
      minError = error_tmp
      k = i
    }
  }
  // if only fit to one model
  let error_all = rmse(points, eq)
  if (error_all < minError) {
    minError = error_all
    k = points.length - 1
  }
  // console.log('numOfCLusters: ', k, ' error: ', minError)
  // console.log(points.slice(0, k))
  let L_cut
  for (let mergeResult of mergeResults) {
    if (mergeResult.numOfClusters === k) {
      // console.log(mergeResult)
      // console.log(mergeResult.partition)
      L_cut = mergeResult.partition
    }
  }
  return L_cut
}

function rmse(points, eq) {
  // root-mean-squared error
  const n = points.length
  let sumError = 0
  for (let i = 0; i < n; i++) {
    const pred_y = eq.slope * points[i].x + eq.intercept
    const error = pred_y - points[i].y
    sumError += error * error
    // console.log(i, 'sumError = ', sumError)
  }
  const rmse = Math.sqrt(sumError / n)
  return rmse
}

function linearRegression(points) {
  var xSum = 0
  var ySum = 0
  var xySum = 0
  var xxSum = 0
  var count = points.length

  for (var i = 0; i < count; i++) {
    var x = points[i].x
    var y = points[i].y
    xSum += x
    ySum += y
    xySum += x * y
    xxSum += x * x
  }

  var slope = (count * xySum - xSum * ySum) / (count * xxSum - xSum * xSum)
  var intercept = ySum / count - (slope * xSum) / count

  return { slope, intercept }
}

module.exports = { L_method }
