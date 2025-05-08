import {
  readFileSync,
  writeFileSync,
  readdirSync,
  existsSync,
  mkdirSync,
} from 'fs';
import { join } from 'path';
import xml2js from 'xml2js';

// 配置XML解析器
const parser = new xml2js.Parser({
  explicitArray: true,
  mergeAttrs: false,
  explicitRoot: false,
});

const parserReanim = (inputPath, outPath) => {
  const xmlContent = readFileSync(inputPath, 'utf-8');
  // 读取XML文件并添加根元素
  const wrappedXml = `<reanim>${xmlContent}</reanim>`;
  parser.parseString(wrappedXml, (err, result) => {
    if (err) {
      console.error('XML解析错误:', err);
      return;
    }

    // 转换数据结构
    const fps = parseInt(result.fps[0], 10);

    const tracks = result.track.map(track => {
      const name = track.name[0];
      const transforms = (track.t || []).map(t => {
        const transform = {};
        if (t && typeof t === 'object') {
          Object.entries(t).forEach(([key, value]) => {
            if (key !== '$') {
              // 数值类型转换
              const numValue = parseFloat(value[0]);
              transform[key] = isNaN(numValue) ? value[0] : numValue;
            }
          });
        }
        return transform;
      });
      return { name, transforms };
    });

    // 构建最终JSON结构
    const output = {
      fps: fps,
      tracks: tracks,
    };

    // 写入文件
    writeFileSync(outPath, JSON.stringify(output, null, 4));
    console.log(`转换成功！生成${outPath}`);
  });
};

const parserReanimDir = (inputDir, outDir) => {
  const dir = readdirSync(inputDir);
  if (!existsSync(outDir)) {
    mkdirSync(outDir);
  }
  dir.forEach(file => {
    const outFile = file.split('.');
    outFile.splice(1, 1, 'json');
    parserReanim(join(inputDir, file), join(outDir, outFile.join('.')));
  });
};
parserReanimDir('./reanim', './anim');
