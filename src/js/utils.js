export function logNameError(type, names=[], limits=0) {
  if (names.length===limits) return true;
  console.error(`Invalid names in ${type}`);
  return false;
}

export function logTimeError(type, span=[]) {
  switch (type) {
    case 'Bend':
      if (span.length===1) return true;
      break;
    case 'Sort':
      if (span[1]>=span[0]) return true;
      break;
    case 'Straighten':
      if (span[1]>=span[0]) return true;
      break;
  }
  console.error(`Invalid time span in ${type}`);
  return false;
}

export function orderModelError(type){
  console.error(`Invalid order type in ${type}`);
}

export function compactModelError(type) {
  console.error(`Invalid compact type in ${type}`)
}

export function alignModelError(type) {
  console.error(`Invalid align type in ${type}`)
}

export function renderModelError(type) {
  console.error(`Invalid render type in ${type}`)
}

export function transformModelError(type) {
  console.error(`Invalid transform type in ${type}`)
}