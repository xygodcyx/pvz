export function waitTime(delta) {
  return new Promise(reslove => {
    setTimeout(() => {
      reslove(true);
    }, delta);
  });
}
