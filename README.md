# 🚀 Mafia Cron Scheduler: Automate Your DeFi Game on PulseChain and BNB Chain 🌟

Welcome to the **Mafia Cron Scheduler**! This project automates calling the `trainSkill` function on a DeFi game smart contract on **PulseChain** and **BNB Chain** every 50 minutes. Whether you're a tech newbie or a seasoned developer, this guide will walk you through everything you need to get started on **Windows**, **Linux**, or **macOS**. Let’s dive in! 🏁

---


## 📜 What This Project Does

This project:
- 🕒 Runs a script every 50 minutes to call `trainSkill` on a smart contract.
- 🌐 Supports **PulseChain**, **BNB Chain**, or both, based on your choice.
- 🔒 Keeps your private keys secure using Foundry’s encrypted keystore.
- 🖥️ Works on Windows (via WSL), Linux, and macOS.

---


## 🛠️ Prerequisites: Install Required Tools

Before you start, you need to install some tools. Follow the instructions for your operating system.

# Install Git

Git is used to download the project code from GitHub.

## Windows
1. Download the Git installer from [git-scm.com](https://git-scm.com/).
2. Run the installer and follow the prompts. Use the default settings unless you have a specific reason to change them.
3. Open a Command Prompt (search for **cmd** in the Start menu) and verify Git is installed:

```bash
git --version
```

You should see something like `git version 2.XX.X`.

## Linux
1. Open a terminal (Ctrl+Alt+T on Ubuntu).
2. Install Git:

   ```bash
   sudo apt update
   sudo apt install git
   ```

3. Verify the installation:

   ```bash
   git --version
   ```

## macOS
1. Open a terminal (search for Terminal in Spotlight).
2. Install Git (Git may already be installed by default, but you can install it via Homebrew if needed):

   ```bash
   brew install git
   ```

3. Verify the installation:

   ```bash
   git --version
   ```

### Installing Homebrew (if you don’t have it)
If Homebrew is not already installed on your macOS, you can install it by running the following command:

```bash
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
```


### 2️⃣ Install Node.js

Node.js is used to run the scheduler script.

#### Windows

1. Download the Node.js installer from [nodejs.org](https://nodejs.org). Choose the "LTS" version.
2. Run the installer and follow the prompts. Make sure to check the box to install npm (Node Package Manager).
3. Open a Command Prompt and verify Node.js and npm are installed:
   ```bash
   node -v
   npm -v
   ```
   You should see versions like `v20.X.X` for Node.js and `10.X.X` for npm.

#### Linux

1. Open a terminal.
2. Install Node.js and npm:
   ```bash
   sudo apt update
   sudo apt install nodejs npm
   ```
3. Verify the installation:
   ```bash
   node -v
   npm -v
   ```

#### macOS

1. Open a terminal.
2. Install Node.js via Homebrew:
   ```bash
   brew install node
   ```
3. Verify the installation:
   ```bash
   node -v
   npm -v
   ```

---


### 3️⃣ Install Foundry

Foundry is used to interact with the smart contract.

#### Windows: Set Up WSL First

Windows users need to use Windows Subsystem for Linux (WSL) because Foundry works best in a Linux environment.

1. **Enable the WSL Feature on Windows**:
   - Open **Control Panel** → **Programs** → **Turn Windows features on or off**.
   - Scroll down and check the box for **Windows Subsystem for Linux**.
   - Click **OK** and restart your computer when prompted.
2. Install WSL:
   - Open a Command Prompt as Administrator (right-click Command Prompt and select "Run as administrator").
   - Run:
     ```bash
     wsl --install
     ```
   - This installs WSL and Ubuntu (a Linux distribution). Restart your computer if prompted.
3. After restarting, open "Ubuntu" from the Start menu. It will set up Ubuntu and ask you to create a username and password.
4. Install Foundry in WSL:
   - Open your Ubuntu terminal (from the Start menu).
   - Install Foundry:
     ```bash
     curl -L https://foundry.paradigm.xyz | bash
     ```
   - Follow the prompts. After installation, run:
     ```bash
     foundryup
     ```
   - Verify Foundry is installed:
     ```bash
     forge --version
     cast --version
     ```
   You should see versions like `forge 0.X.X` and `cast 0.X.X`.

#### Linux

1. Open a terminal.
2. Install Foundry:
   ```bash
   curl -L https://foundry.paradigm.xyz | bash
   ```
3. Follow the prompts, then run:
   ```bash
   foundryup
   ```
4. Verify the installation:
   ```bash
   forge --version
   cast --version
   ```

#### macOS

1. Open a terminal.
2. Install Foundry:
   ```bash
   curl -L https://foundry.paradigm.xyz | bash
   ```
3. Follow the prompts, then run:
   ```bash
   foundryup
   ```
4. Verify the installation:
   ```bash
   forge --version
   cast --version
   ```

---


### 4️⃣ Install pm2 (Optional but Recommended)

pm2 keeps the script running in the background.

#### Windows (in WSL), Linux, and macOS

1. Open a terminal (Ubuntu terminal for Windows users).
2. Install pm2 globally using npm:
   ```bash
   npm install -g pm2
   ```
3. Verify the installation:
   ```bash
   pm2 --version
   ```

---


## 👜 Clone the Project

Now that you have the tools installed, let’s download the project.

1. Clone the Repository:
   - Windows: Open your Ubuntu terminal (from the Start menu).
   - Linux/macOS: Open a terminal.
   - Run:
     ```bash
     git clone --recurse-submodules https://github.com/Psyphon361/mafia-scheduler.git
     ```
     - The `--recurse-submodules` flag ensures the `mafia-scripts-foundry` submodule is also cloned.
2. Navigate to the Project Directory:
   ```bash
   cd mafia-scheduler
   ```

---


## 🛠️ Set Up the Project

Let’s set up the project step-by-step.

### 1️⃣ Install Node.js Dependencies

In the `mafia-cron-scheduler` directory, install the required Node.js packages:
```bash
npm install
```

### 2️⃣ Install Foundry Dependencies

1. Navigate to the `mafia-scripts-foundry` submodule:
   ```bash
   cd mafia-scripts-foundry
   ```
2. Install Foundry dependencies:
   ```bash
   forge install
   ```
3. Return to the main directory:
   ```bash
   cd ..
   ```

---

## 🔐 Secure Your Private Keys with Foundry’s Keystore

To keep your private keys safe, we’ll use Foundry’s `cast wallet import` to encrypt them with a password. This is a critical security step! 🔐

### Why This Is Important

Storing your private key in plain text (e.g., in the `.env` file) is dangerous. If someone accesses your computer, they can steal your funds.
Using `cast wallet import`, your private key is encrypted and stored securely on your computer, protected by a password. Only you can decrypt it with the password.

### Steps to Encrypt Your Private Key

#### Import Your PulseChain Private Key:
Run:
```bash
cast wallet import <KEYSTORE_NAME> --interactive
```
You’ll be prompted to enter your private key (without the `0x` prefix) and a password.
Choose a strong password (e.g., at least 12 characters, mix of letters, numbers, and symbols). Write it down and store it securely (e.g., in a password manager or on paper in a safe place).

**Example:**
```text
Enter private key: <your-private-key>
Enter password: <your-strong-password>
Confirm password: <your-strong-password>
```
This creates an encrypted keystore file in `~/.foundry/keystores/`.

#### Import Your BNB Chain Private Key:
If you’re using a different private key for BNB Chain, repeat the process with a different name:
```bash
cast wallet import <BNB_KEYSTORE_NAME> --interactive
```
If you’re using the same private key for both chains, you can skip this step and use the same keystore name for both.

---


## 📝 Create the `.env` File

The `.env` file stores your configuration settings. Let’s create it.

### Create the File:
In the `mafia-cron-scheduler` directory, create a file named `.env`:

- **Windows (WSL)/Linux/macOS:** Use a text editor like nano:
  ```bash
  nano .env
  ```
  Or create it manually in your file explorer.

### Add the Following Content:
Copy and paste this into your `.env` file, replacing the placeholders with your values:

```text
PLS_RPC_URL=https://rpc-pulsechain.g4mm4.io
BNB_RPC_URL=https://bsc-dataseed.bnbchain.org
PLS_KEYSTORE_NAME=<your-pls-keystore-name>
BNB_KEYSTORE_NAME=<your-bnb-keystore-name>
PLS_KEYSTORE_PASSWORD=<your-pls-keystore-password>
BNB_KEYSTORE_PASSWORD=<your-bnb-keystore-password>
CHAIN_CHOICE=2  # 0 -> PLS, 1 -> BNB, 2 -> BOTH
```

### Explanation:
- `PLS_RPC_URL`: The PulseChain RPC URL (default provided).
- `BNB_RPC_URL`: The BNB Chain RPC URL (default provided).
- `PLS_KEYSTORE_NAME`: The name of your PulseChain keystore (e.g., `MARCHESI`).
- `BNB_KEYSTORE_NAME`: The name of your BNB Chain keystore (e.g., `MARCHESI` or `MARCHESI_BNB`).
- `PLS_KEYSTORE_PASSWORD`: The password you set for your PulseChain keystore.
- `BNB_KEYSTORE_PASSWORD`: The password you set for your BNBChain keystore.
- `CHAIN_CHOICE`: Choose which chain(s) to run:
  - `0`: PulseChain only
  - `1`: BNB Chain only
  - `2`: Both chains

### Save and Exit:
If using nano, press `Ctrl+O`, then `Enter` to save, and `Ctrl+X` to exit.

---


## 🚀 Run the Project

Now you’re ready to run the scheduler!

### 1️⃣ Test the Script

Run the script to ensure everything works:
```bash
node run-train-script.js
```

You should see logs like:
```text
Scheduler started. Command will run every 50 minutes.
[2025-03-20T13:15:00.479Z] Running trainSkill command on PLS...
[2025-03-20T13:15:00.479Z] Running trainSkill command on BNB...
```

### 2️⃣ Run in the Background with pm2

Start the script with pm2:
```bash
pm2 start run-train-script.js
```

Save the pm2 process to ensure it runs on system startup:
```bash
pm2 save
```

View the logs to confirm it’s running:
```bash
pm2 logs run-train-script
```

### 3️⃣ Updating Configuration

If you change the `.env` file (e.g., switch `CHAIN_CHOICE`), restart the pm2 process to apply the changes:
```bash
pm2 restart run-train-script
```

### 4️⃣ Updating the Submodule

If the `mafia-scripts-foundry` submodule has been updated, run the following to get the latest changes:
```bash
cd mafia-scripts-foundry
git pull origin main
cd ..
git submodule update --init --recursive
```
Then restart the pm2 process:
```bash
pm2 restart run-train-script
```

---


## 🔒 Best Security Practices

Security is critical when dealing with private keys and blockchain transactions. Follow these practices to stay safe:

### 1️⃣ Protect Your Private Keys

- **Never Share Your Private Key:** Your private key gives full access to your funds. Never share it with anyone, including the project maintainers.
- **Use Foundry’s Keystore:** By using `cast wallet import`, your private key is encrypted and stored securely. Only the password can decrypt it.
- **Choose a Strong Password:** Use a password that’s at least 12 characters long, with a mix of uppercase, lowercase, numbers, and symbols (e.g., `MySecurePass123!`).
- **Store Passwords Safely:** Write down your keystore password and store it in a secure place (e.g., a password manager like LastPass or a physical safe). Don’t store it on your computer in plain text.

### 2️⃣ Secure Your `.env` File

- **Don’t Commit `.env` to Git:** The `.env` file contains sensitive data (like your keystore passwords). It’s already in `.gitignore`, so it won’t be committed to GitHub.
- **Restrict File Permissions:**
  - **Linux/macOS:** Run:
    ```bash
    chmod 600 .env
    ```
  - **Windows (WSL):** The above command works in WSL. On Windows itself, right-click the `.env` file, go to **Properties > Security**, and ensure only your user account has access.
  - **Backup Your `.env` File:** Copy it to a secure location (e.g., an encrypted USB drive) in case you lose it.

### 3️⃣ General Security Tips

- **Keep Your System Secure:** Ensure your computer is protected with antivirus software and a firewall.
- **Use a Dedicated Account:** Consider using a separate wallet with a small amount of funds for this project, rather than your main wallet.
- **Monitor Logs:** Regularly check `pm2 logs run-trainskill` for errors or unexpected behavior.
- **Update Dependencies:** Keep Node.js, Foundry, and pm2 up to date to avoid security vulnerabilities:
  ```bash
  npm install -g npm
  foundryup
  npm install -g pm2
  ```

---


## 🚧 Troubleshooting

### Error: "forge: command not found":
- Ensure Foundry is installed (see the "Install Foundry" section).
- Run `foundryup` again.

### Error: "node: command not found":
- Ensure Node.js is installed (see the "Install Node.js" section).

### Transaction Reverts:
- This might be due to a cooldown period in the smart contract. Wait and try again, or check the contract logic if you have access.

### Logs Not Showing:
- Ensure pm2 is running:
  ```bash
  pm2 list
  ```
- View logs:
  ```bash
  pm2 logs run-trainskill
  ```

### Submodule Not Found:
- If you cloned the repo without submodules, initialize them:
  ```bash
  git submodule update --init --recursive
  ```

---


## 🎉 Congratulations!

You’ve successfully set up the Mafia Cron Scheduler! Your script will now run every 50 minutes, automating your DeFi game on PulseChain, BNB Chain, or both. If you have any questions or run into issues, feel free to reach out. Happy automating! 🚀

---

### ❤️ Made with Love

by [Tanish](https://github.com/Psyphon361) aka [Psyphon](https://pulsemafia.io/profile/psyphon)

### Disclaimer  
This is an open-source project licensed under the **MIT License**.  
Please note that **I am not responsible for any financial losses, damages, or issues that may arise from using this code**. This is a decentralized finance (DeFi) project, and by using it, you acknowledge that you are solely responsible for the code you decide to run on your machine. **Exercise caution and always do your own research (DYOR)**.  


### Support This Project  
If you found this project helpful and would like to support its development, you can donate to the following address:

**Donation Address:** `0x44782f177962D7bb766B4853d3428A7b44802aA2`
