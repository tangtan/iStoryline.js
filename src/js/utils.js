export function logNameError(type, names=[], limits=0) {
  console.error(`Invalid names in ${type}`);
}

export function logTimeError(type, span=[]) {
  console.error(`Invalid time span in ${type}`);
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