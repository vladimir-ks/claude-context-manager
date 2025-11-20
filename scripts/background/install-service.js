#!/usr/bin/env node

/**
 * Install Background Update Checker Service
 *
 * Platform-specific service installation:
 * - macOS: LaunchAgent
 * - Linux: systemd user service (fallback to cron)
 * - Windows: Task Scheduler
 *
 * Author: Vladimir K.S.
 */

const fs = require('fs');
const path = require('path');
const os = require('os');
const { execSync } = require('child_process');

const platform = os.platform();

/**
 * Install macOS LaunchAgent
 */
function installMacOS() {
  const homeDir = os.homedir();
  const launchAgentsDir = path.join(homeDir, 'Library', 'LaunchAgents');
  const plistPath = path.join(launchAgentsDir, 'com.vladks.claude-context-manager.update-checker.plist');

  // Ensure LaunchAgents directory exists
  if (!fs.existsSync(launchAgentsDir)) {
    fs.mkdirSync(launchAgentsDir, { recursive: true, mode: 0o755 });
  }

  // Get node path and script path
  const nodePath = process.execPath;
  const scriptPath = path.join(__dirname, 'update-checker.js');

  // Create plist content
  const plist = `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
    <key>Label</key>
    <string>com.vladks.claude-context-manager.update-checker</string>
    <key>ProgramArguments</key>
    <array>
        <string>${nodePath}</string>
        <string>${scriptPath}</string>
    </array>
    <key>StartInterval</key>
    <integer>28800</integer>
    <key>RunAtLoad</key>
    <false/>
    <key>StandardOutPath</key>
    <string>${homeDir}/.claude-context-manager/logs/update-checker.stdout.log</string>
    <key>StandardErrorPath</key>
    <string>${homeDir}/.claude-context-manager/logs/update-checker.stderr.log</string>
</dict>
</plist>`;

  // Write plist file
  fs.writeFileSync(plistPath, plist, { mode: 0o644 });

  // Load LaunchAgent
  try {
    execSync(`launchctl load "${plistPath}"`, { stdio: 'inherit' });
    console.log('✓ macOS LaunchAgent installed and loaded');
    console.log(`  ${plistPath}`);
    return true;
  } catch (error) {
    console.log('⚠ LaunchAgent created but failed to load');
    console.log(`  Run manually: launchctl load "${plistPath}"`);
    return false;
  }
}

/**
 * Install Linux systemd user service
 */
function installLinuxSystemd() {
  const homeDir = os.homedir();
  const systemdDir = path.join(homeDir, '.config', 'systemd', 'user');
  const servicePath = path.join(systemdDir, 'ccm-update-checker.service');
  const timerPath = path.join(systemdDir, 'ccm-update-checker.timer');

  // Ensure systemd user directory exists
  if (!fs.existsSync(systemdDir)) {
    fs.mkdirSync(systemdDir, { recursive: true, mode: 0o755 });
  }

  // Get node path and script path
  const nodePath = process.execPath;
  const scriptPath = path.join(__dirname, 'update-checker.js');

  // Create service file
  const serviceContent = `[Unit]
Description=Claude Context Manager Update Checker
After=network.target

[Service]
Type=oneshot
ExecStart=${nodePath} ${scriptPath}

[Install]
WantedBy=default.target
`;

  // Create timer file (every 8 hours)
  const timerContent = `[Unit]
Description=Run CCM Update Checker every 8 hours
Requires=ccm-update-checker.service

[Timer]
OnBootSec=5min
OnUnitActiveSec=8h
Persistent=true

[Install]
WantedBy=timers.target
`;

  // Write files
  fs.writeFileSync(servicePath, serviceContent, { mode: 0o644 });
  fs.writeFileSync(timerPath, timerContent, { mode: 0o644 });

  // Enable and start timer
  try {
    execSync('systemctl --user daemon-reload', { stdio: 'inherit' });
    execSync('systemctl --user enable ccm-update-checker.timer', { stdio: 'inherit' });
    execSync('systemctl --user start ccm-update-checker.timer', { stdio: 'inherit' });
    console.log('✓ Linux systemd user service installed and started');
    console.log(`  ${servicePath}`);
    console.log(`  ${timerPath}`);
    return true;
  } catch (error) {
    console.log('⚠ Systemd service created but failed to start');
    console.log('  Falling back to cron...');
    return false;
  }
}

/**
 * Install Linux cron job (fallback)
 */
function installLinuxCron() {
  const nodePath = process.execPath;
  const scriptPath = path.join(__dirname, 'update-checker.js');

  // Create cron entry (every 8 hours)
  // Use absolute path instead of ~ (which cron doesn't expand)
  const logPath = path.join(os.homedir(), '.claude-context-manager', 'logs', 'update-checker.log');
  const cronEntry = `0 */8 * * * ${nodePath} ${scriptPath} >> ${logPath} 2>&1`;

  try {
    // Get existing crontab
    let existingCron = '';
    try {
      existingCron = execSync('crontab -l 2>/dev/null', { encoding: 'utf8' });
    } catch (error) {
      // No existing crontab
    }

    // Check if entry already exists
    if (existingCron.includes('update-checker.js')) {
      console.log('✓ Cron job already exists');
      return true;
    }

    // Add new entry
    const newCron = existingCron + (existingCron ? '\n' : '') + cronEntry + '\n';

    // Write to temp file and install
    const tmpFile = path.join(os.tmpdir(), 'ccm-crontab.tmp');
    fs.writeFileSync(tmpFile, newCron);

    execSync(`crontab ${tmpFile}`, { stdio: 'inherit' });
    fs.unlinkSync(tmpFile);

    console.log('✓ Linux cron job installed');
    console.log(`  ${cronEntry}`);
    return true;
  } catch (error) {
    console.log('✗ Failed to install cron job');
    console.log(`  Error: ${error.message}`);
    return false;
  }
}

/**
 * Install Windows Task Scheduler task
 */
function installWindows() {
  const nodePath = process.execPath;
  const scriptPath = path.join(__dirname, 'update-checker.js');

  // Get current date for StartBoundary (use current date + 1 minute)
  const startDate = new Date();
  startDate.setMinutes(startDate.getMinutes() + 1);
  const startBoundary = startDate.toISOString().split('.')[0]; // Remove milliseconds

  // Create task XML
  const taskXml = `<?xml version="1.0" encoding="UTF-16"?>
<Task version="1.2" xmlns="http://schemas.microsoft.com/windows/2004/02/mit/task">
  <RegistrationInfo>
    <Description>Claude Context Manager Update Checker</Description>
  </RegistrationInfo>
  <Triggers>
    <TimeTrigger>
      <Repetition>
        <Interval>PT8H</Interval>
        <StopAtDurationEnd>false</StopAtDurationEnd>
      </Repetition>
      <StartBoundary>${startBoundary}</StartBoundary>
      <Enabled>true</Enabled>
    </TimeTrigger>
  </Triggers>
  <Settings>
    <MultipleInstancesPolicy>IgnoreNew</MultipleInstancesPolicy>
    <DisallowStartIfOnBatteries>false</DisallowStartIfOnBatteries>
    <StopIfGoingOnBatteries>false</StopIfGoingOnBatteries>
    <AllowHardTerminate>true</AllowHardTerminate>
    <StartWhenAvailable>true</StartWhenAvailable>
    <RunOnlyIfNetworkAvailable>true</RunOnlyIfNetworkAvailable>
    <AllowStartOnDemand>true</AllowStartOnDemand>
    <Enabled>true</Enabled>
    <Hidden>false</Hidden>
    <RunOnlyIfIdle>false</RunOnlyIfIdle>
    <WakeToRun>false</WakeToRun>
    <ExecutionTimeLimit>PT10M</ExecutionTimeLimit>
    <Priority>7</Priority>
  </Settings>
  <Actions>
    <Exec>
      <Command>${nodePath}</Command>
      <Arguments>${scriptPath}</Arguments>
    </Exec>
  </Actions>
</Task>`;

  // Write to temp file
  const tmpFile = path.join(os.tmpdir(), 'ccm-task.xml');
  fs.writeFileSync(tmpFile, taskXml);

  try {
    // Create task
    execSync(`schtasks /create /tn "CCMUpdateChecker" /xml "${tmpFile}" /f`, { stdio: 'inherit' });
    fs.unlinkSync(tmpFile);

    console.log('✓ Windows Task Scheduler task installed');
    console.log('  Task Name: CCMUpdateChecker');
    return true;
  } catch (error) {
    console.log('✗ Failed to install Windows task');
    console.log(`  Error: ${error.message}`);
    return false;
  }
}

// Main installation
console.log('\nInstalling CCM Background Update Checker...\n');

let success = false;

if (platform === 'darwin') {
  success = installMacOS();
} else if (platform === 'linux') {
  // Try systemd first, fallback to cron
  success = installLinuxSystemd();
  if (!success) {
    success = installLinuxCron();
  }
} else if (platform === 'win32') {
  success = installWindows();
} else {
  console.log(`✗ Unsupported platform: ${platform}`);
  process.exit(1);
}

if (success) {
  console.log('\n✓ Background update checker installed successfully');
  console.log('  Checks every 8 hours for updates');
  console.log('  Notifies once per 24 hours if update available');
  console.log('\n  Disable: ccm notifications off');
  console.log('  Enable:  ccm notifications on\n');
} else {
  console.log('\n⚠ Installation completed with warnings');
  console.log('  Update checker may not run automatically\n');
}

process.exit(success ? 0 : 1);
