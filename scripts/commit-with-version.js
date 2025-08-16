#!/usr/bin/env node

import { execSync } from "child_process";
import { readFileSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// 获取命令行参数
const args = process.argv.slice(2);
const commitMessage = args.join(" ");

if (!commitMessage) {
  console.error("❌ 请提供提交信息");
  console.log('用法: node scripts/commit-with-version.js "提交信息"');
  process.exit(1);
}

try {
  console.log("🔄 开始自动提交流程...");

  // 1. 递增版本号
  console.log("📦 递增版本号...");
  execSync("node scripts/bump-version.js", { stdio: "inherit" });

  // 2. 添加所有文件到暂存区
  console.log("📁 添加文件到暂存区...");
  execSync("git add .", { stdio: "inherit" });

  // 3. 提交
  console.log("💾 提交更改...");
  execSync(`git commit -m "${commitMessage}"`, { stdio: "inherit" });

  // 4. 显示当前版本
  const versionFilePath = join(__dirname, "../src/config/version.js");
  const versionContent = readFileSync(versionFilePath, "utf8");
  const versionMatch = versionContent.match(
    /version:\s*["']v?(\d+\.\d+\.\d+)["']/,
  );

  if (versionMatch) {
    console.log(`✅ 提交完成！当前版本: v${versionMatch[1]}`);
  } else {
    console.log("✅ 提交完成！");
  }
} catch (error) {
  console.error(
    "❌ 提交失败:",
    error instanceof Error ? error.message : String(error),
  );
  process.exit(1);
}
