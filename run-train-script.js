const { exec } = require("child_process");
require("dotenv").config();

// Define base commands (without account and password, which will be added dynamically)
const plsBaseCommand = `forge script script/PLS_TrainSkillScript.s.sol:PLS_TrainSkillScript --rpc-url ${process.env.PLS_RPC_URL} --broadcast`;
const bnbBaseCommand = `forge script script/BNB_TrainSkillScript.s.sol:BNB_TrainSkillScript --rpc-url ${process.env.BNB_RPC_URL} --broadcast`;

// Load CHAIN_CHOICE and trainType from .env (default to 0 if not set)
const chainChoice = parseInt(process.env.CHAIN_CHOICE || "0");
const plsTrainType = parseInt(process.env.PLS_TRAIN_TYPE || "0"); // Default to BOTTLES_IN_BACKYARD (0)
const bnbTrainType = parseInt(process.env.BNB_TRAIN_TYPE || "0"); // Default to BOTTLES_IN_BACKYARD (0)

// Split keystore names and passwords into arrays, handling undefined/empty cases
const plsKeystoreNames = process.env.PLS_KEYSTORE_NAME ? process.env.PLS_KEYSTORE_NAME.split(",").map(name => name.trim()) : [];
const bnbKeystoreNames = process.env.BNB_KEYSTORE_NAME ? process.env.BNB_KEYSTORE_NAME.split(",").map(name => name.trim()) : [];
const plsKeystorePasswords = process.env.PLS_KEYSTORE_PASSWORD ? process.env.PLS_KEYSTORE_PASSWORD.split(",").map(pw => pw.trim()) : [];
const bnbKeystorePasswords = process.env.BNB_KEYSTORE_PASSWORD ? process.env.BNB_KEYSTORE_PASSWORD.split(",").map(pw => pw.trim()) : [];

// Validate input
if (plsKeystoreNames.length === 0 || bnbKeystoreNames.length === 0) {
    console.error("Error: At least one keystore name must be provided for each chain.");
    process.exit(1);
}
if (plsKeystoreNames.length !== plsKeystorePasswords.length || bnbKeystoreNames.length !== bnbKeystorePasswords.length) {
    console.error("Error: Number of keystore names must match number of passwords for each chain.");
    process.exit(1);
}

// Function to run the command for a single PLS keystore
function runTrainSkill_PLS(keystoreName, keystorePassword) {
    const plsCommand = `${plsBaseCommand} --account ${keystoreName} --password ${keystorePassword} --sig "run(uint8)" ${plsTrainType}`;
    console.log(`[${new Date().toISOString()}] Running trainSkill command on PLS for keystore: ${keystoreName} with trainType: ${plsTrainType}...`);
    exec(plsCommand, { cwd: "./mafia-scripts-foundry" }, (error, stdout, stderr) => {
        if (error) {
            console.error(`PLS Error for ${keystoreName}: ${error.message}`);
            return;
        }
        if (stderr) {
            console.error(`PLS stderr for ${keystoreName}: ${stderr}`);
            return;
        }
        console.log(`PLS output for ${keystoreName}: ${stdout}`);
    });
}

// Function to run the command for a single BNB keystore
function runTrainSkill_BNB(keystoreName, keystorePassword) {
    const bnbCommand = `${bnbBaseCommand} --account ${keystoreName} --password ${keystorePassword} --sig "run(uint8)" ${bnbTrainType}`;
    console.log(`[${new Date().toISOString()}] Running trainSkill command on BNB for keystore: ${keystoreName} with trainType: ${bnbTrainType}...`);
    exec(bnbCommand, { cwd: "./mafia-scripts-foundry" }, (error, stdout, stderr) => {
        if (error) {
            console.error(`BNB Error for ${keystoreName}: ${error.message}`);
            return;
        }
        if (stderr) {
            console.error(`BNB stderr for ${keystoreName}: ${stderr}`);
            return;
        }
        console.log(`BNB output for ${keystoreName}: ${stdout}`);
    });
}

// Function to run trainSkill for all wallets based on CHAIN_CHOICE
function runTrainSkill() {
    if (chainChoice === 0) {
        // Run for all PLS wallets
        plsKeystoreNames.forEach((keystoreName, index) => {
            const keystorePassword = plsKeystorePasswords[index];
            runTrainSkill_PLS(keystoreName, keystorePassword);
        });
    } else if (chainChoice === 1) {
        // Run for all BNB wallets
        bnbKeystoreNames.forEach((keystoreName, index) => {
            const keystorePassword = bnbKeystorePasswords[index];
            runTrainSkill_BNB(keystoreName, keystorePassword);
        });
    } else if (chainChoice === 2) {
        // Run for all PLS and BNB wallets
        plsKeystoreNames.forEach((keystoreName, index) => {
            const keystorePassword = plsKeystorePasswords[index];
            runTrainSkill_PLS(keystoreName, keystorePassword);
        });
        bnbKeystoreNames.forEach((keystoreName, index) => {
            const keystorePassword = bnbKeystorePasswords[index];
            runTrainSkill_BNB(keystoreName, keystorePassword);
        });
    } else {
        console.error(`Invalid CHAIN_CHOICE: ${chainChoice}. Use 0 (PLS), 1 (BNB), or 2 (BOTH).`);
    }
}

// Run every 50 minutes (50 * 60 * 1000 milliseconds)
setInterval(() => {
    runTrainSkill();
}, 50 * 60 * 1000);

// Run once immediately to test
runTrainSkill();

console.log("Scheduler started. Command will run every 50 minutes.");