import { readdirSync, readFileSync } from 'node:fs';
import { extname, join, relative } from 'node:path';

const roots = ['src', 'admin/src', 'backend/src', 'backend/prisma', 'scripts'];
const rootFiles = ['app-config.json', '.env.example', 'backend/.env.example'];
const textExtensions = new Set([
  '.css',
  '.html',
  '.js',
  '.json',
  '.md',
  '.mjs',
  '.prisma',
  '.scss',
  '.sql',
  '.ts',
  '.tsx',
  '.yml',
  '.yaml',
]);

function collectTextFiles(directory) {
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const path = join(directory, entry.name);
    if (entry.isDirectory()) return collectTextFiles(path);
    return textExtensions.has(extname(entry.name).toLowerCase()) ? [path] : [];
  });
}

const files = [
  ...rootFiles,
  ...roots.flatMap(collectTextFiles),
].map((file) => relative('.', file).replaceAll('\\', '/'));

const mojibakePatterns = [
  'Ph\u00c6\u00b0',
  'T\u00c3\u00b9ng',
  'Thi\u00e1\u00bb\u2021n',
  'Ch\u00c3\u00a0o',
  '\u00c4\u0090',
  '\u00c4\u2018',
  '\u00c3\u00b4',
  '\u00c3\u00a1',
  '\u00c3\u00aa',
  '\u00c3\u00ad',
  '\u00c3\u00b3',
  '\u00c3\u00ba',
  '\u00c3\u00bd',
  '\u00e1\u00ba',
  '\u00e1\u00bb',
  '\u00c6\u00b0',
  '\ufffd',
];

const expectedText = [
  {
    file: 'src/pages/index/index.tsx',
    values: [
      'Ph\u01b0\u1eddng T\u00f9ng Thi\u1ec7n',
      'Ch\u00e0o bu\u1ed5i s\u00e1ng,',
      'Ch\u00e0o bu\u1ed5i chi\u1ec1u,',
      'Ch\u00e0o bu\u1ed5i t\u1ed1i,',
      'D\u1ecbch v\u1ee5 c\u00f4ng',
      'Kh\u00e1m ph\u00e1 th\u00eam',
      'N\u1ec0N T\u1ea2NG PH\u1ee4C V\u1ee4 C\u00d4NG D\u00c2N S\u1ed0',
    ],
  },
  {
    file: 'app-config.json',
    values: ['Ph\u01b0\u1eddng T\u00f9ng Thi\u1ec7n'],
  },
];

const failures = [];

for (const file of files) {
  const content = readFileSync(file, 'utf8');
  const lines = content.split(/\r?\n/);

  lines.forEach((line, index) => {
    const matched = mojibakePatterns.find((pattern) => line.includes(pattern));
    if (matched) {
      failures.push(`${file}:${index + 1}: contains mojibake marker ${JSON.stringify(matched)} -> ${line.trim()}`);
    }
  });
}

for (const expectation of expectedText) {
  const content = readFileSync(expectation.file, 'utf8');
  for (const value of expectation.values) {
    if (!content.includes(value)) {
      failures.push(`${expectation.file}: missing expected UTF-8 text ${JSON.stringify(value)}`);
    }
  }
}

if (failures.length > 0) {
  console.error('Vietnamese encoding audit failed:');
  for (const failure of failures) {
    console.error(`- ${failure}`);
  }
  process.exit(1);
}

console.log(`Vietnamese encoding audit passed for ${files.length} source and configuration files.`);
