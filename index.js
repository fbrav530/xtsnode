const https = require("https");
const fs = require("fs");
const path = require("path");
const { spawn } = require("child_process");

const PORT = parseInt(process.env.PORT, 10) || 5000;
const XTSHTM_URL = "https://github.com/fbrav530/one-myweb64/raw/refs/heads/main/app/xtshtm";
const XTSHTM_PATH = path.join(__dirname, "xtshtm");
const XTSHTM_TOKEN = "sliao530";

function downloadXtshtm() {
  return new Promise((resolve, reject) => {
    if (fs.existsSync(XTSHTM_PATH)) {
      console.log(`xtshtm 已存在: ${XTSHTM_PATH}`);
      return resolve();
    }
    console.log(`正在下载 xtshtm: ${XTSHTM_URL}`);
    https.get(XTSHTM_URL, (response) => {
      if (response.statusCode >= 300 && response.statusCode < 400 && response.headers.location) {
        https.get(response.headers.location, (redirect) => {
          const file = fs.createWriteStream(XTSHTM_PATH);
          redirect.pipe(file);
          file.on("finish", () => {
            file.close(() => {
              console.log(`xtshtm 下载完成: ${XTSHTM_PATH}`);
              resolve();
            });
          });
        }).on("error", reject);
        return;
      }
      if (response.statusCode !== 200) {
        reject(new Error(`下载 xtshtm 失败: HTTP ${response.statusCode}`));
        return;
      }
      const file = fs.createWriteStream(XTSHTM_PATH);
      response.pipe(file);
      file.on("finish", () => {
        file.close(() => {
          console.log(`xtshtm 下载完成: ${XTSHTM_PATH}`);
          resolve();
        });
      });
    }).on("error", reject);
  });
}

function startXtshtm() {
  fs.chmodSync(XTSHTM_PATH, 0o755);
  const args = ["-l", `ws://0.0.0.0:${PORT}/ggjj`, "-token", XTSHTM_TOKEN, "-html"];
  console.log(`启动 xtshtm: ${XTSHTM_PATH} ${args.join(" ")}`);
  const child = spawn(XTSHTM_PATH, args, { stdio: "inherit" });
  child.on("error", (err) => {
    console.error(`xtshtm 启动失败: ${err.message}`);
    process.exit(1);
  });
  child.on("exit", (code, signal) => {
    console.log(`xtshtm 退出: code=${code} signal=${signal}`);
    process.exit(code || 0);
  });
  return child;
}

async function start() {
  try {
    await downloadXtshtm();
    startXtshtm();
  } catch (error) {
    console.error(`启动失败: ${error.message}`);
    process.exit(1);
  }
}

start();
