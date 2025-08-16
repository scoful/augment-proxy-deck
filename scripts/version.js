#!/usr/bin/env node

import { readFileSync, writeFileSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// 版本文件路径
const versionFilePath = join(__dirname, "../src/config/version.js");

// 获取命令行参数
const args = process.argv.slice(2);
const command = args[0];

function getCurrentVersion() {
  const content = readFileSync(versionFilePath, "utf8");
  const match = content.match(/version:\s*["']v?(\d+)\.(\d+)\.(\d+)["']/);
  if (!match) {
    throw new Error("无法解析版本号格式");
  }
  return {
    major: parseInt(match[1] || "0"),
    minor: parseInt(match[2] || "0"),
    patch: parseInt(match[3] || "0"),
    full: `v${match[1]}.${match[2]}.${match[3]}`,
  };
}

/**
 * @param {number} major
 * @param {number} minor
 * @param {number} patch
 */
function updateVersion(major, minor, patch) {
  const content = readFileSync(versionFilePath, "utf8");
  const newVersion = `v${major}.${minor}.${patch}`;
  const newContent = content.replace(
    /version:\s*["']v?\d+\.\d+\.\d+["']/,
    `version: "${newVersion}"`,
  );
  writeFileSync(versionFilePath, newContent, "utf8");
  return newVersion;
}

function showHelp() {
  console.log(`
📦 版本管理工具

用法:
  node scripts/version.js <command>

命令:
  patch     递增补丁版本 (x.x.X)
  minor     递增次版本 (x.X.0)
  major     递增主版本 (X.0.0)
  current   显示当前版本
  help      显示帮助信息

示例:
  node scripts/version.js patch    # v0.1.3 → v0.1.4
  node scripts/version.js minor    # v0.1.3 → v0.2.0
  node scripts/version.js major    # v0.1.3 → v1.0.0
`);
}

try {
  const current = getCurrentVersion();

  switch (command) {
    case "patch":
      const newPatch = updateVersion(
        current.major,
        current.minor,
        current.patch + 1,
      );
      console.log(`✅ 补丁版本更新: ${current.full} → ${newPatch}`);
      break;

    case "minor":
      const newMinor = updateVersion(current.major, current.minor + 1, 0);
      console.log(`✅ 次版本更新: ${current.full} → ${newMinor}`);
      break;

    case "major":
      const newMajor = updateVersion(current.major + 1, 0, 0);
      console.log(`✅ 主版本更新: ${current.full} → ${newMajor}`);
      break;

    case "current":
      console.log(`📦 当前版本: ${current.full}`);
      break;

    case "help":
    case undefined:
      showHelp();
      break;

    default:
      console.error(`❌ 未知命令: ${command}`);
      showHelp();
      process.exit(1);
  }
} catch (error) {
  console.error(
    "❌ 版本操作失败:",
    error instanceof Error ? error.message : String(error),
  );
  process.exit(1);
}
