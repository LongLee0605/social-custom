import { execSync } from 'child_process';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import chalk from 'chalk';
import ora from 'ora';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const rootDir = join(__dirname, '..');

const args = process.argv.slice(2);
const hostingOnly = args.includes('--hosting-only');

const log = {
  success: (msg) => console.log(chalk.green(`✓ ${msg}`)),
  error: (msg) => console.log(chalk.red(`✗ ${msg}`)),
  info: (msg) => console.log(chalk.blue(`ℹ ${msg}`)),
  warning: (msg) => console.log(chalk.yellow(`⚠ ${msg}`)),
  step: (msg) => console.log(chalk.cyan(`→ ${msg}`)),
};

const banner = () => {
  console.log('\n');
  console.log(chalk.red.bold('╔═══════════════════════════════════════════════════════════════╗'));
  console.log(chalk.red.bold('║                                                               ║'));
  console.log(chalk.red.bold('║') + chalk.yellow.bold('    ███████╗██╗██████╗ ███████╗██████╗  █████╗ ███████╗███████╗     ') + chalk.red.bold('║'));
  console.log(chalk.red.bold('║') + chalk.yellow.bold('    ██╔════╝██║██╔══██╗██╔════╝██╔══██╗██╔══██╗██╔════╝██╔════╝     ') + chalk.red.bold('║'));
  console.log(chalk.red.bold('║') + chalk.yellow.bold('    █████╗  ██║██████╔╝█████╗  ██████╔╝███████║█████╗  █████╗       ') + chalk.red.bold('║'));
  console.log(chalk.red.bold('║') + chalk.yellow.bold('    ██╔══╝  ██║██╔══██╗██╔══╝  ██╔══██╗██╔══██║██╔══╝  ██╔══╝       ') + chalk.red.bold('║'));
  console.log(chalk.red.bold('║') + chalk.yellow.bold('    ██║     ██║██║  ██║███████╗██████╔╝██║  ██║███████╗███████╗     ') + chalk.red.bold('║'));
  console.log(chalk.red.bold('║') + chalk.yellow.bold('    ╚═╝     ╚═╝╚═╝  ╚═╝╚══════╝╚═════╝ ╚═╝  ╚═╝╚══════╝╚══════╝     ') + chalk.red.bold('║'));
  console.log(chalk.red.bold('║                                                               ║'));
  console.log(chalk.red.bold('║') + chalk.green.bold('        🚀  DEPLOYING TO FIREBASE HOSTING  🚀              ') + chalk.red.bold('║'));
  console.log(chalk.red.bold('║                                                               ║'));
  console.log(chalk.red.bold('╚═══════════════════════════════════════════════════════════════╝'));
  console.log('\n');
  
  const time = new Date().toLocaleTimeString('vi-VN');
  console.log(chalk.gray(`[${time}]`) + chalk.cyan(' Initializing deployment sequence...'));
  console.log(chalk.gray('─'.repeat(65)));
  console.log('\n');
};

const runCommand = (command, options = {}) => {
  try {
    const output = execSync(command, {
      cwd: rootDir,
      stdio: options.silent ? 'pipe' : 'inherit',
      encoding: 'utf-8',
    });
    return { success: true, output };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

const checkFirebaseAuth = () => {
  const spinner = ora({
    text: chalk.cyan('Verifying Firebase authentication...'),
    spinner: {
      interval: 80,
      frames: ['⠋', '⠙', '⠹', '⠸', '⠼', '⠴', '⠦', '⠧', '⠇', '⠏']
    },
  }).start();
  try {
    execSync('npx firebase projects:list', {
      cwd: rootDir,
      stdio: 'pipe',
    });
    spinner.succeed(chalk.green('Firebase authentication verified'));
    return true;
  } catch (error) {
    spinner.fail(chalk.red('Firebase authentication failed'));
    log.error('Please run: npx firebase login');
    return false;
  }
};

const buildProject = () => {
  const spinner = ora({
    text: chalk.cyan('Building project for production...'),
    spinner: {
      interval: 80,
      frames: ['⠋', '⠙', '⠹', '⠸', '⠼', '⠴', '⠦', '⠧', '⠇', '⠏']
    },
  }).start();

  const result = runCommand('npm run build', { silent: true });

  if (result.success) {
    spinner.succeed(chalk.green('Project built successfully'));
    return true;
  } else {
    spinner.fail(chalk.red('Build failed'));
    log.error(result.error);
    return false;
  }
};

const deployToFirebase = () => {
  const spinner = ora({
    text: chalk.cyan('Deploying to Firebase Hosting...'),
    spinner: {
      interval: 80,
      frames: ['⠋', '⠙', '⠹', '⠸', '⠼', '⠴', '⠦', '⠧', '⠇', '⠏']
    },
  }).start();

  const result = runCommand('npx firebase deploy --only hosting', { silent: false });

  if (result.success) {
    spinner.succeed(chalk.green('Deployed to Firebase Hosting successfully'));
    return true;
  } else {
    spinner.fail(chalk.red('Deployment failed'));
    log.error(result.error);
    return false;
  }
};

const showSummary = (success) => {
  console.log('\n');
  if (success) {
    console.log(chalk.green.bold('╔═══════════════════════════════════════════════════════════════╗'));
    console.log(chalk.green.bold('║') + chalk.white.bold('  ✅  DEPLOYMENT SUCCESSFUL - YOUR APP IS NOW LIVE!      ') + chalk.green.bold('║'));
    console.log(chalk.green.bold('╚═══════════════════════════════════════════════════════════════╝'));
    console.log('\n');
    log.info('Your app is now live on Firebase Hosting!');
    log.step('Check your Firebase Console for the hosting URL');
    console.log('\n');
    console.log(chalk.cyan('💡 Quick access:'));
    console.log(chalk.white('   • Firebase Console: ') + chalk.yellow('https://console.firebase.google.com/'));
    console.log(chalk.white('   • View your deployed app in the Hosting section'));
    console.log('\n');
  } else {
    console.log(chalk.red.bold('╔═══════════════════════════════════════════════════════════════╗'));
    console.log(chalk.red.bold('║') + chalk.white.bold('  ❌  DEPLOYMENT FAILED - CHECK ERRORS ABOVE              ') + chalk.red.bold('║'));
    console.log(chalk.red.bold('╚═══════════════════════════════════════════════════════════════╝'));
    console.log('\n');
    log.warning('Please check the error messages above');
    console.log('\n');
  }
};

const main = async () => {
  banner();

  if (!hostingOnly) {
    log.step('Step 1: Building project');
    if (!buildProject()) {
      showSummary(false);
      process.exit(1);
    }
    console.log('');
  }

  log.step('Step 2: Verifying Firebase authentication');
  if (!checkFirebaseAuth()) {
    showSummary(false);
    process.exit(1);
  }
  console.log('');

  log.step('Step 3: Deploying to Firebase Hosting');
  const deploySuccess = deployToFirebase();

  showSummary(deploySuccess);

  if (!deploySuccess) {
    process.exit(1);
  }
};

main().catch((error) => {
  log.error('Unexpected error:', error.message);
  process.exit(1);
});

