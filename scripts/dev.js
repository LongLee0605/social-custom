import { spawn } from 'child_process';
import chalk from 'chalk';
import ora from 'ora';

const banner = () => {
  console.clear();
  console.log('\n');
  console.log(chalk.green.bold('╔═══════════════════════════════════════════════════════════════╗'));
  console.log(chalk.green.bold('║                                                               ║'));
  console.log(chalk.green.bold('║') + chalk.cyan.bold('    ███████╗██╗ ██████╗ ███████╗███████╗██████╗      ') + chalk.green.bold('║'));
  console.log(chalk.green.bold('║') + chalk.cyan.bold('    ██╔════╝██║██╔════╝ ██╔════╝██╔════╝██╔══██╗     ') + chalk.green.bold('║'));
  console.log(chalk.green.bold('║') + chalk.cyan.bold('    ███████╗██║██║  ███╗█████╗  █████╗  ██████╔╝     ') + chalk.green.bold('║'));
  console.log(chalk.green.bold('║') + chalk.cyan.bold('    ╚════██║██║██║   ██║██╔══╝  ██╔══╝  ██╔══██╗     ') + chalk.green.bold('║'));
  console.log(chalk.green.bold('║') + chalk.cyan.bold('    ███████║██║╚██████╔╝███████╗███████╗██║  ██║     ') + chalk.green.bold('║'));
  console.log(chalk.green.bold('║') + chalk.cyan.bold('    ╚══════╝╚═╝ ╚═════╝ ╚══════╝╚══════╝╚═╝  ╚═╝     ') + chalk.green.bold('║'));
  console.log(chalk.green.bold('║                                                               ║'));
  console.log(chalk.green.bold('║') + chalk.yellow.bold('           🚀  DEVELOPMENT SERVER INITIALIZING  🚀          ') + chalk.green.bold('║'));
  console.log(chalk.green.bold('║                                                               ║'));
  console.log(chalk.green.bold('╚═══════════════════════════════════════════════════════════════╝'));
  console.log('\n');
  
  const time = new Date().toLocaleTimeString('vi-VN');
  console.log(chalk.gray(`[${time}]`) + chalk.cyan(' Initializing development environment...'));
  console.log(chalk.gray('─'.repeat(65)));
  console.log('\n');
};

const showSystemInfo = () => {
  const nodeVersion = process.version;
  const platform = process.platform;
  const arch = process.arch;
  
  console.log(chalk.cyan.bold('📊 SYSTEM INFORMATION'));
  console.log(chalk.gray('─'.repeat(65)));
  console.log(chalk.white(`  Node.js:    ${chalk.green(nodeVersion)}`));
  console.log(chalk.white(`  Platform:   ${chalk.green(platform)}`));
  console.log(chalk.white(`  Architecture: ${chalk.green(arch)}`));
  console.log(chalk.gray('─'.repeat(65)));
  console.log('\n');
};

const startDevServer = () => {
  const spinner = ora({
    text: chalk.cyan('Starting Vite development server...'),
    spinner: 'dots',
  }).start();

  setTimeout(() => {
    spinner.succeed(chalk.green('Development server ready!'));
    console.log('\n');
    console.log(chalk.green.bold('╔═══════════════════════════════════════════════════════════════╗'));
    console.log(chalk.green.bold('║') + chalk.white.bold('  ✅  SERVER RUNNING - ACCESS YOUR APP AT:              ') + chalk.green.bold('║'));
    console.log(chalk.green.bold('║') + chalk.cyan.bold('     http://localhost:5173                                ') + chalk.green.bold('║'));
    console.log(chalk.green.bold('╚═══════════════════════════════════════════════════════════════╝'));
    console.log('\n');
    console.log(chalk.yellow('💡 Press ') + chalk.white.bold('Ctrl+C') + chalk.yellow(' to stop the server'));
    console.log('\n');
  }, 1500);

  const vite = spawn('npx', ['vite'], {
    stdio: 'inherit',
    shell: true,
  });

  vite.on('error', (error) => {
    spinner.fail(chalk.red('Failed to start development server'));
    console.error(chalk.red(error.message));
    process.exit(1);
  });

  vite.on('exit', (code) => {
    if (code !== 0 && code !== null) {
      console.log('\n');
      console.log(chalk.red.bold('╔═══════════════════════════════════════════════════════════════╗'));
      console.log(chalk.red.bold('║') + chalk.white.bold('  ❌  DEVELOPMENT SERVER STOPPED                        ') + chalk.red.bold('║'));
      console.log(chalk.red.bold('╚═══════════════════════════════════════════════════════════════╝'));
      console.log('\n');
    }
    process.exit(code || 0);
  });

  process.on('SIGINT', () => {
    console.log('\n\n');
    console.log(chalk.yellow('🛑 Shutting down development server...'));
    vite.kill();
    setTimeout(() => {
      console.log(chalk.green('✅ Server stopped successfully'));
      process.exit(0);
    }, 500);
  });
};

const main = () => {
  banner();
  showSystemInfo();
  startDevServer();
};

main();

