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

const plsNickCarTypes =
  chainChoice === 0 || chainChoice === 2 ? process.env.PLS_NICK_CAR_TYPE?.split(",").map((type) => type?.trim() === 'false' ? false : parseInt(type.trim())) ?? [0] : [];

const bnbNickCarTypes =
  chainChoice === 1 || chainChoice === 2 ? process.env.BNB_NICK_CAR_TYPE?.split(",").map((type) => type?.trim() === 'false' ? false : parseInt(type.trim())) ?? [0] : [];

const plsJailBust =
  chainChoice === 1 || chainChoice === 2 ? 
    process.env.PLS_JAIL_BUST?.split(",").map((type) => !!type?.trim() || false ) ?? [] 
    : [];

const bnbJailBust =
  chainChoice === 1 || chainChoice === 2 ? 
    process.env.BNB_JAIL_BUST?.split(",").map((type) => !!type?.trim() || false ) ?? []
    : [];

console.log('pls jail bust', plsJailBust);
console.log('bnb jail bust', bnbJailBust);

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

// helper fn
function createRoundRobin(array) {
  if (!Array.isArray(array) || array.length === 0) {
    throw new Error('Round-robin requires a non-empty array');
  }

  let index = 0;

  return function next() {
    const item = array[index];
    index = (index + 1) % array.length; // This is the key: modulo wraps around
    return item;
  };
}

function runTrainSkill_PLS(keystoreName, keystorePassword, trainType) {
  const plsCommand = `${plsBaseCommand} --account ${keystoreName} --password '${keystorePassword}' --sig "run(uint8)" ${trainType}`;
  console.log(`[${new Date().toISOString()}] PLS trainSkill: '${keystoreName}' with trainType ${trainType}`);

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
  const bnbCommand = `${bnbBaseCommand} --account ${keystoreName} --password '${keystorePassword}' --sig "run(uint8)" ${trainType}`;
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

async function runNickCar_PLS(keystoreName, keystorePassword, carType) {

  const expires = Date.now() + (86400 * 1000);
  const publicKey = await getKeystoreAddress(keystoreName, keystorePassword);
  const message = `Sign in pulsemafia.io with ${publicKey} - expire at ${expires}`;
  const signature = await signMessage(keystoreName, keystorePassword, message);

  const plsCommand = `${plsBaseCommand} --account ${keystoreName} --password '${keystorePassword}' --sig "runNickCar(uint8, string, bytes)" ${carType} '${message}' ${signature}`;
  console.log(`[${new Date().toISOString()}] PLS nickCar: ${keystoreName} with carType ${carType}`);

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

async function runNickCar_BNB(keystoreName, keystorePassword, carType) {

  const expires = Date.now() + (86400 * 1000);
  const publicKey = await getKeystoreAddress(keystoreName, keystorePassword);
  const message = `Sign in bnbmafia.io with ${publicKey} - expire at ${expires}`;
  const signature = await signMessage(keystoreName, keystorePassword, message);
  const bnbCommand = `${bnbBaseCommand} --account ${keystoreName} --password '${keystorePassword}' --sig "runNickCar(uint8, string, bytes)" ${carType} '${message}' ${signature}`;
  console.log(`[${new Date().toISOString()}] BNB nickCar: ${keystoreName} with carType ${carType}`);

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

async function runJailBust_PLS(keystoreName, keystorePassword, prisoner) {
  const bnbCommand = `${plsBaseCommand} --account ${keystoreName} --password '${keystorePassword}' --sig "runBustOut(address)" ${prisoner}`;
  console.log(`[${new Date().toISOString()}] PLS JailBust: ${keystoreName} with prisoner ${prisoner}`);

  exec(bnbCommand, { cwd: "./mafia-scripts-foundry" }, (error, stdout, stderr) => {
    if (error) {
      console.error(`[${new Date().toISOString()}] ❌ PLS txn failed for ${keystoreName}: ${error.message}`);
      return;
    }
    if (stderr && !stderr.includes("Warning")) {
      console.warn(`[${new Date().toISOString()}] ⚠️ PLS stderr for ${keystoreName}: ${stderr}`);
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
      console.log(`[${new Date().toISOString()}] ✅ PLS Success for ${keystoreName} (no explicit output)`);
    } else {
      console.log(`[${new Date().toISOString()}] ✅ PLS Success for ${keystoreName}: ${usefulLines.join(" | ")}`);
    }
  });
}

async function runJailBust_BNB(keystoreName, keystorePassword, prisoner) {

  const bnbCommand = `${bnbBaseCommand} --account ${keystoreName} --password '${keystorePassword}' --sig "runBustOut(address)" ${prisoner}`;
  console.log(`[${new Date().toISOString()}] BNB JailBust: ${keystoreName} with prisoner ${prisoner}`);

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

function runNickCar() {
  if (chainChoice === 0 || chainChoice === 2) {
    plsKeystoreNames.forEach((keystoreName, index) => {
      const keystorePassword = plsKeystorePasswords[index];
      const carType = plsNickCarTypes[index];
      if (carType === false || carType === 'false') return; 
      runNickCar_PLS(keystoreName, keystorePassword, carType);
    });
  }

  if (chainChoice === 1 || chainChoice === 2) {
    bnbKeystoreNames.forEach((keystoreName, index) => {
      const keystorePassword = bnbKeystorePasswords[index];
      const carType = bnbNickCarTypes[index];
      if (carType === false || carType === 'false') return;
      runNickCar_BNB(keystoreName, keystorePassword, carType);
    });
  }
}

async function runJailbust() {

  if (chainChoice === 0 || chainChoice === 2) {

    const plsBusters = plsKeystoreNames.map((keystoreName, index) => {
      const keystorePassword = plsKeystorePasswords[index];
      const jailBust = plsJailBust[index];
      if (jailBust) {
        return {
          keystoreName,
          keystorePassword
        };
      }
    }).filter(i => i);

    // if there is at least 1 buster, let em loose 
    if (plsBusters?.length) {

      if (!plsNames) plsNames = await getNames('pls');

      getPrisoners('pls').then(prisoners => {

        if (prisoners?.length) {

          let refreshCache = false;
          prisoners = prisoners.map(p => {
            const address = plsNames.find(n => n?.name == p?.name)?.address;
            if (!address) refreshCache = true;
            else p.address = address;
            return p;
          });

          if (refreshCache) plsNames = null;

          console.log("PLS prisoners", prisoners.length);
          // sort prisoners easiest -> hardest
          const now = Date.now() / 1000;
          prisoners = prisoners
            .filter(p => p.jailedUntil > now) // still jailed
            .sort((a, b) => a.jailedUntil - b.jailedUntil); // ascending = soonest first

          const nextPrisoner = createRoundRobin(prisoners);

          for (const buster of plsBusters) {
            const prisoner = nextPrisoner();
            if (prisoner.address)
              runJailBust_PLS(buster.keystoreName, buster.keystorePassword, prisoner.address);
          }
        }
      });
    }

  }

  if (chainChoice === 1 || chainChoice === 2) {

    const bnbBusters = bnbKeystoreNames.map((keystoreName, index) => {
      const keystorePassword = bnbKeystorePasswords[index];
      const jailBust = bnbJailBust[index];
      if (jailBust) {
        return {
          keystoreName,
          keystorePassword
        };
      }
    }).filter(i => i);

    // if there is at least 1 buster, let em loose 
    if (bnbBusters?.length) {

      if (!bnbNames) bnbNames = await getNames('bnb');

      getPrisoners('bnb').then(prisoners => {
        if (prisoners?.length) {

          let refreshCache = false;
          prisoners = prisoners.map(p => {
            const address = bnbNames.find(n => n?.name == p?.name)?.address;
            if (!address) refreshCache = true;
            else p.address = address;
            return p;
          });

          if (refreshCache) bnbNames = null;

          console.log("BNB prisoners", prisoners.length);

          // sort prisoners easiest -> hardest
          // less time to serve are easeir to bust.
          const now = Date.now() / 1000;
          prisoners = prisoners
            .filter(p => p.jailedUntil > now) // still jailed
            .sort((a, b) => a.jailedUntil - b.jailedUntil); // ascending = soonest first

          const nextPrisoner = createRoundRobin(prisoners);

          for (const buster of bnbBusters) {
            const prisoner = nextPrisoner();
            if (prisoner.address)
              runJailBust_BNB(buster.keystoreName, buster.keystorePassword, prisoner.address);
          }
        }
      });
    }

  }
}

function getKeystoreAddress(keystoreName, keystorePassword) {
  const keystore = `~/.foundry/keystores/` + keystoreName;
  return new Promise((res, rej) => {
    exec(`cast wallet address --keystore ${keystore} --password '${keystorePassword}'`, (error, stdout, stderr) => {
      if (error) return rej(err);
      if (stderr) return rej(err);
      res(stdout);
    });
  });
}

function signMessage(keystoreName, keystorePassword, message = '') {
  // TODO: optional keystore dir set in the environment vars
  const keystore = `~/.foundry/keystores/` + keystoreName;
  return new Promise((res, rej) => {
    exec(`cast wallet sign --keystore ${keystore} --password '${keystorePassword}' '${message}'`, (error, stdout, stderr) => {
      if (error) return rej(err);
      if (stderr) return rej(err);
      res(stdout);
    });
  });
}

let bnbNames, plsNames;

async function getPrisoners(chain = 'bnb') {

  // settle with jacobs server for the time being.
  // TODO: calculate prisoners from blockchain or reliable source.
  const urls = {
    'bnb': `https://backendbnb.playmafia.io/profile/jail`,
    'pls': `https://backendpls.playmafia.io/profile/jail`,
  };

  // Create an AbortController to handle timeout
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 20000); // 20 seconds

  const fetchOptions = {
    options: {},
    signal: controller.signal
  };

  try {
    const response = await fetch(urls[chain], fetchOptions);

    // Clear the timeout since the request completed
    clearTimeout(timeoutId);

    // Check if response is OK (status 200-299)
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    // Parse and return JSON
    const data = await response.json();
    return data;

  } catch (error) {
    // Clear timeout in case it hasn't fired yet
    clearTimeout(timeoutId);

    // Handle different types of errors
    if (error.name === 'AbortError') {
      throw new Error('Request timed out after 20 seconds');
    }

    // Re-throw other errors (network issues, JSON parse errors, etc.)
    throw error;
  }

}

async function getNames(chain = 'bnb') {

  // settle with jacobs server for the time being.
  // TODO: calculate prisoners from blockchain or reliable source.
  const urls = {
    'bnb': `https://backendbnb.playmafia.io/profile/names`,
    'pls': `https://backendpls.playmafia.io/profile/names`,
  };  

  // Create an AbortController to handle timeout
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 20000); // 20 seconds

  const fetchOptions = {
    options: {},
    signal: controller.signal
  };

  try {
    const response = await fetch(urls[chain], fetchOptions);

    // Clear the timeout since the request completed
    clearTimeout(timeoutId);

    // Check if response is OK (status 200-299)
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    // Parse and return JSON
    const data = await response.json();
    return data;

  } catch (error) {
    // Clear timeout in case it hasn't fired yet
    clearTimeout(timeoutId);

    // Handle different types of errors
    if (error.name === 'AbortError') {
      throw new Error('Request timed out after 20 seconds');
    }

    // Re-throw other errors (network issues, JSON parse errors, etc.)
    throw error;
  }

}

// Triggerhappy:
// if the function calls run together they take each others transaction nonce and one will fail.
// they have to be ran at different intervals, so give nick car a 3 min delay

// Run every 50 mins
setInterval(() => {
  runNickCar();
}, 50 * 60 * 1000);

// Run every 47 mins
setInterval(() => {
  runTrainSkill();
}, 47 * 60 * 1000);
  
// Run every 15 mins
setInterval(() => {
  runJailbust();
}, 15 * 60 * 1000);
  
//now
runTrainSkill();

// in 1 min
setTimeout(runJailbust, 60000)

// in 3 mins. allways keep a reasonable amount of time between calls.
setTimeout(() => {
  runNickCar();
}, 3 * 60000)

console.log("Scheduler started.");
console.log("Train will run every 47 minutes.");
console.log("NickCar will run every 50.");
console.log("Jailbust will run every 15.");
