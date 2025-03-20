const { exec } = require("child_process");
const cron = require("node-cron");

// Load environment variables from .env file (optional but recommended)
require("dotenv").config();

// Define the command to execute
const command = `forge script script/TrainSkillScript.s.sol:TrainSkillScript --rpc-url ${process.env.PLS_RPC_URL} --private-key MAFIA_KEY --broadcast`;

// Function to run the command
function runTrainSkill() {
    console.log(`[${new Date().toISOString()}] Running trainSkill command...`);

    exec(command, (error, stdout, stderr) => {
        if (error) {
            console.error(`Error executing command: ${error.message}`);
            return;
        }
        if (stderr) {
            console.error(`Command stderr: ${stderr}`);
            return;
        }
        console.log(`Command output: ${stdout}`);
    });
}

// Schedule the command to run every 45 minutes
cron.schedule("*/45 * * * *", () => {
    runTrainSkill();
});

// Run it once immediately to test
runTrainSkill();

console.log("Scheduler started. Command will run every 45 minutes.");