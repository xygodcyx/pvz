const fs = require('fs');
const path = require('path');

class FileEntry {
  constructor(name, length) {
    this.name = name;
    this.length = length;
  }
}

function parsePakFile(buffer) {
  let offset = 9; // 跳过初始 9 字节
  const entries = [];

  while (true) {
    const nameLen = buffer.readUInt8(offset++);
    const name = buffer.toString('ascii', offset, offset + nameLen);
    offset += nameLen;

    const fileLen = buffer.readUInt32LE(offset);
    offset += 4;

    offset += 8; // 跳过保留字节
    const flag = buffer.readUInt8(offset++);

    entries.push(
      new FileEntry(
        name.replace(/\\/g, path.sep), // 路径标准化
        fileLen
      )
    );

    if (flag === 0x80) break;
  }

  return { entries, dataOffset: offset };
}

function ensureDirectory(filePath) {
  const dir = path.dirname(filePath);
  !fs.existsSync(dir) && fs.mkdirSync(dir, { recursive: true });
}

try {
  // 读取整个文件到 Buffer
  const pakBuffer = fs.readFileSync('main.de.pak');

  // 解析文件结构
  const { entries, dataOffset } = parsePakFile(pakBuffer);
  console.log(`找到 ${entries.length} 个文件条目`);

  // 写入文件系统
  let currentOffset = dataOffset;
  for (const entry of entries) {
    const fileData = pakBuffer.subarray(
      currentOffset,
      currentOffset + entry.length
    );
    currentOffset += entry.length;

    ensureDirectory(entry.name);
    fs.writeFileSync(entry.name, fileData);
    console.log(`已提取: ${entry.name} (${entry.length} 字节)`);
  }

  console.log('解包完成');
} catch (error) {
  console.error('处理失败:', error.message);
  process.exit(1);
}
