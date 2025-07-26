const { exec } = require("child_process");
require("dotenv").config();

const plsBaseCommand = `forge script script/PLS_TrainSkillScript.s.sol:PLS_TrainSkillScript --rpc-url ${process.env.PLS_RPC_URL} --broadcast`;
const bnbBaseCommand = `forge script script/BNB_TrainSkillScript.s.sol:BNB_TrainSkillScript --rpc-url ${process.env.BNB_RPC_URL} --broadcast`;

const chainChoice = parseInt(process.env.CHAIN_CHOICE || "0");
console.log("Chain choice:", chainChoice);

if (![0, 1, 2].includes(chainChoice)) {
  console.error("Error: CHAIN_CHOICE must be 0 (PLS), 1 (BNB), or 2 (BOTH).\n");
  process.exit(1);
}

const plsKeystoreNames = chainChoice === 0 || chainChoice === 2 ? process.env.PLS_KEYSTORE_NAME?.split(",").map((name) => name.trim()) ?? [] : [];

const bnbKeystoreNames = chainChoice === 1 || chainChoice === 2 ? process.env.BNB_KEYSTORE_NAME?.split(",").map((name) => name.trim()) ?? [] : [];

const plsKeystorePasswords = chainChoice === 0 || chainChoice === 2 ? process.env.PLS_KEYSTORE_PASSWORD?.split(",").map((pw) => pw.trim()) ?? [] : [];

const bnbKeystorePasswords = chainChoice === 1 || chainChoice === 2 ? process.env.BNB_KEYSTORE_PASSWORD?.split(",").map((pw) => pw.trim()) ?? [] : [];

const plsTrainTypes =
  chainChoice === 0 || chainChoice === 2 ? process.env.PLS_TRAIN_TYPE?.split(",").map((type) => parseInt(type.trim())) ?? [0] : [];

const bnbTrainTypes =
  chainChoice === 1 || chainChoice === 2 ? process.env.BNB_TRAIN_TYPE?.split(",").map((type) => parseInt(type.trim())) ?? [0] : [];

// Validation
if (
  (chainChoice === 0 || chainChoice === 2) &&
  (plsKeystoreNames.length === 0 || plsKeystoreNames.length !== plsKeystorePasswords.length || plsKeystoreNames.length !== plsTrainTypes.length)
) {
  console.error("PLS configuration error: Check keystore names, passwords, and train types.");
  process.exit(1);
}

if (
  (chainChoice === 1 || chainChoice === 2) &&
  (bnbKeystoreNames.length === 0 || bnbKeystoreNames.length !== bnbKeystorePasswords.length || bnbKeystoreNames.length !== bnbTrainTypes.length)
) {
  console.error("BNB configuration error: Check keystore names, passwords, and train types.");
  process.exit(1);
}

function runTrainSkill_PLS(keystoreName, keystorePassword, trainType) {
  const plsCommand = `${plsBaseCommand} --account ${keystoreName} --password ${keystorePassword} --sig "run(uint8)" ${trainType}`;
  console.log(`[${new Date().toISOString()}] PLS trainSkill: ${keystoreName} with trainType ${trainType}`);

  exec(plsCommand, { cwd: "./mafia-scripts-foundry" }, (error, stdout, stderr) => {
    if (error) {
      console.error(`[${new Date().toISOString()}] ❌ PLS txn failed for ${keystoreName}: ${error.message}`);
      return;
    }
    if (stderr && !stderr.includes("Warning")) {
      console.warn(`[${new Date().toISOString()}] ⚠️ PLS stderr for ${keystoreName}: ${stderr}`);
    }

    // Filter foundry noise
    const usefulLines = stdout
      .split("\n")
      .map((line) => line.trim())
      .filter(
        (line) =>
          line &&
          !line.startsWith("Setting up") &&
          !line.startsWith("Chain") &&
          !line.includes("Estimated") &&
          !line.includes("EXECUTION COMPLETE") &&
          !line.includes("Transactions saved to") &&
          !line.includes("Sensitive values saved to")
      );

    if (usefulLines.length === 0) {
      console.log(`[${new Date().toISOString()}] ✅ PLS Success for ${keystoreName} (no explicit output)`);
    } else {
      console.log(`[${new Date().toISOString()}] ✅ PLS Success for ${keystoreName}: ${usefulLines.join(" | ")}`);
    }
  });
}

function runTrainSkill_BNB(keystoreName, keystorePassword, trainType) {
  const bnbCommand = `${bnbBaseCommand} --account ${keystoreName} --password ${keystorePassword} --sig "run(uint8)" ${trainType}`;
  console.log(`[${new Date().toISOString()}] BNB trainSkill: ${keystoreName} with trainType ${trainType}`);

  exec(bnbCommand, { cwd: "./mafia-scripts-foundry" }, (error, stdout, stderr) => {
    if (error) {
      console.error(`[${new Date().toISOString()}] ❌ BNB txn failed for ${keystoreName}: ${error.message}`);
      return;
    }
    if (stderr && !stderr.includes("Warning")) {
      console.warn(`[${new Date().toISOString()}] ⚠️ BNB stderr for ${keystoreName}: ${stderr}`);
    }

    const usefulLines = stdout
      .split("\n")
      .map((line) => line.trim())
      .filter(
        (line) =>
          line &&
          !line.startsWith("Setting up") &&
          !line.startsWith("Chain") &&
          !line.includes("Estimated") &&
          !line.includes("EXECUTION COMPLETE") &&
          !line.includes("Transactions saved to") &&
          !line.includes("Sensitive values saved to")
      );

    if (usefulLines.length === 0) {
      console.log(`[${new Date().toISOString()}] ✅ BNB Success for ${keystoreName} (no explicit output)`);
    } else {
      console.log(`[${new Date().toISOString()}] ✅ BNB Success for ${keystoreName}: ${usefulLines.join(" | ")}`);
    }
  });
}

function runTrainSkill() {
  if (chainChoice === 0 || chainChoice === 2) {
    plsKeystoreNames.forEach((keystoreName, index) => {
      const keystorePassword = plsKeystorePasswords[index];
      const trainType = plsTrainTypes[index];
      runTrainSkill_PLS(keystoreName, keystorePassword, trainType);
    });
  }

  if (chainChoice === 1 || chainChoice === 2) {
    bnbKeystoreNames.forEach((keystoreName, index) => {
      const keystorePassword = bnbKeystorePasswords[index];
      const trainType = bnbTrainTypes[index];
      runTrainSkill_BNB(keystoreName, keystorePassword, trainType);
    });
  }
}

// Run every 47 mins
setInterval(() => {
  runTrainSkill();
}, 47 * 60 * 1000);

runTrainSkill();
console.log("Scheduler started. Command will run every 47 minutes.");
