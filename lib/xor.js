const fs = require('fs');
const { pipeline } = require('stream');

// 创建可读流和可写流
const reader = fs.createReadStream('main.pak');
const writer = fs.createWriteStream('main.de.pak');

// 错误处理
const handleError = err => {
  console.error('Fail to open the file...', err);
  process.exit(1);
};

reader.on('error', handleError);
writer.on('error', handleError);

// 流处理管道
pipeline(
  reader,
  // 转换流：每个字节异或 0xF7
  async function* (source) {
    for await (const chunk of source) {
      yield Buffer.from(chunk.map(b => b ^ 0xf7));
    }
  },
  writer,
  err => {
    if (err) {
      console.error('Processing failed:', err);
    } else {
      console.log('Completed...');
    }
  }
);
