#!/usr/bin/env node

import { readFileSync, writeFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// 版本文件路径
const versionFilePath = join(__dirname, '../src/config/version.js');

try {
  // 读取当前版本文件
  const versionFileContent = readFileSync(versionFilePath, 'utf8');
  
  // 提取当前版本号
  const versionMatch = versionFileContent.match(/version:\s*["']v?(\d+)\.(\d+)\.(\d+)["']/);
  
  if (!versionMatch) {
    console.error('❌ 无法解析版本号格式');
    process.exit(1);
  }
  
  const [, major, minor, patch] = versionMatch;
  const newPatch = parseInt(patch) + 1;
  const newVersion = `v${major}.${minor}.${newPatch}`;
  
  // 替换版本号
  const newContent = versionFileContent.replace(
    /version:\s*["']v?\d+\.\d+\.\d+["']/,
    `version: "${newVersion}"`
  );
  
  // 写入新版本
  writeFileSync(versionFilePath, newContent, 'utf8');
  
  console.log(`✅ 版本号已更新: ${versionMatch[0].match(/v?\d+\.\d+\.\d+/)[0]} → ${newVersion}`);
  
} catch (error) {
  console.error('❌ 版本更新失败:', error.message);
  process.exit(1);
}
