import fs from 'fs';
import path from 'path';
function copyFile(intDir, outDir, suffix) {
  if (!fs.existsSync(outDir)) {
    fs.mkdirSync(outDir);
  }
  const dir = fs.readdirSync(intDir);
  fs.mkdirSync(path.join(outDir), { recursive: true });
  dir.forEach(file => {
    if (file.split('.').pop() !== suffix) {
      return;
    }
    fs.copyFileSync(path.join(intDir, file), path.join(outDir, file));
  });
}
function copyReanim(intDir, outDir) {
  copyFile(intDir, outDir, 'reanim');
}
function copyPng(intDir, outDir) {
  copyFile(intDir, outDir, 'png');
}
function copyFla(intDir, outDir) {
  copyFile(intDir, outDir, 'fla');
}
const intDir = path.join(process.cwd(), 'asset');
copyReanim(intDir, path.join(process.cwd(), 'reanim'));
copyFla(intDir, path.join(process.cwd(), 'reanim_fla'));
copyPng(intDir, path.join(process.cwd(), 'reanim_png'));
