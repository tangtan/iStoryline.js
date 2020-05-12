export function logConstraintError(type) {
  console.warn(`Invalid names in ${type}`);
}

export function logGeneratorError(type, module) {
  console.warn(`Invalid ${module} generator in ${type}`);
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
