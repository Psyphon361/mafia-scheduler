const { exec } = require("child_process");
require("dotenv").config();

// Define the commands
const pls_command = `forge script script/PLS_TrainSkillScript.s.sol:PLS_TrainSkillScript --rpc-url ${process.env.PLS_RPC_URL} --account ${process.env.PLS_KEYSTORE_NAME} --password ${process.env.PLS_KEYSTORE_PASSWORD} --broadcast`;
const bnb_command = `forge script script/BNB_TrainSkillScript.s.sol:BNB_TrainSkillScript --rpc-url ${process.env.BNB_RPC_URL} --account ${process.env.BNB_KEYSTORE_NAME} --password ${process.env.BNB_KEYSTORE_PASSWORD} --broadcast`;

// Load CHAIN_CHOICE from .env (default to 0 if not set)
const chainChoice = parseInt(process.env.CHAIN_CHOICE || "0");

// Function to run the command for PLS
function runTrainSkill_PLS() {
    console.log(`[${new Date().toISOString()}] Running trainSkill command on PLS...`);
    exec(pls_command, { cwd: "./mafia-scripts-foundry" }, (error, stdout, stderr) => {
        if (error) {
            console.error(`PLS Error: ${error.message}`);
            return;
        }
        if (stderr) {
            console.error(`PLS stderr: ${stderr}`);
            return;
        }
        console.log(`PLS output: ${stdout}`);
    });
}

// Function to run the command for BNB
function runTrainSkill_BNB() {
    console.log(`[${new Date().toISOString()}] Running trainSkill command on BNB...`);
    exec(bnb_command, { cwd: "./mafia-scripts-foundry" }, (error, stdout, stderr) => {
        if (error) {
            console.error(`BNB Error: ${error.message}`);
            return;
        }
        if (stderr) {
            console.error(`BNB stderr: ${stderr}`);
            return;
        }
        console.log(`BNB output: ${stdout}`);
    });
}

// Function to decide which chain(s) to run based on CHAIN_CHOICE
function runTrainSkill() {
    if (chainChoice === 0) {
        runTrainSkill_PLS(); // Only PLS
    } else if (chainChoice === 1) {
        runTrainSkill_BNB(); // Only BNB
    } else if (chainChoice === 2) {
        runTrainSkill_PLS(); // Both
        runTrainSkill_BNB();
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