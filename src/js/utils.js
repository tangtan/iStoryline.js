export function logNameError(type, names, limits = 0) {
  switch (type) {
    case "Compress":
    case "Expand":
    case "Merge":
    case "Split":
      if (names.length >= 2) return true;
  }
  if (names.length === limits) return true;
  console.error(`Invalid names in ${type}: `, names);
  return false;
}

export function logTimeError(type, span = []) {
  switch (type) {
    case "Bend":
      if (span.length === 1) return true;
    case "Space":
    case "Scale":
    case "Reshape":
      return true;
    default:
      if (span[1] >= span[0]) return true;
  }
  console.error(`Invalid time span in ${type}: `, span);
  return false;
}

export function orderModelError(type) {
  console.error(`Invalid order type in ${type}`);
}

export function compactModelError(type) {
  console.error(`Invalid compact type in ${type}`);
}

export function alignModelError(type) {
  console.error(`Invalid align type in ${type}`);
}

export function renderModelError(type) {
  console.error(`Invalid render type in ${type}`);
}

export function transformModelError(type) {
  console.error(`Invalid transform type in ${type}`);
}
