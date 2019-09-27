export function logNameError(type, names=[], limits=0) {
  console.error(`Invalid names in ${type}`);
}

export function logTimeError(type, span=[]) {
  console.error(`Invalid time span in ${type}`);
}