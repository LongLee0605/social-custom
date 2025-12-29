import { execSync } from 'child_process';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { existsSync, readdirSync, statSync } from 'fs';
import chalk from 'chalk';
import ora from 'ora';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const rootDir = join(__dirname, '..');

const banner = () => {
  console.log('\n');
  console.log(chalk.cyan.bold('╔═══════════════════════════════════════════════════════════════╗'));
  console.log(chalk.cyan.bold('║                                                               ║'));
  console.log(chalk.cyan.bold('║') + chalk.yellow.bold('    ██████╗ ██╗   ██╗██╗     ██╗     ██████╗ ██████╗      ') + chalk.cyan.bold('║'));
  console.log(chalk.cyan.bold('║') + chalk.yellow.bold('    ██╔══██╗██║   ██║██║     ██║     ██╔══██╗██╔══██╗     ') + chalk.cyan.bold('║'));
  console.log(chalk.cyan.bold('║') + chalk.yellow.bold('    ██████╔╝██║   ██║██║     ██║     ██║  ██║██║  ██║     ') + chalk.cyan.bold('║'));
  console.log(chalk.cyan.bold('║') + chalk.yellow.bold('    ██╔══██╗██║   ██║██║     ██║     ██║  ██║██║  ██║     ') + chalk.cyan.bold('║'));
  console.log(chalk.cyan.bold('║') + chalk.yellow.bold('    ██████╔╝╚██████╔╝███████╗███████╗██████╔╝██████╔╝     ') + chalk.cyan.bold('║'));
  console.log(chalk.cyan.bold('║') + chalk.yellow.bold('    ╚═════╝  ╚═════╝ ╚══════╝╚══════╝╚═════╝ ╚═════╝      ') + chalk.cyan.bold('║'));
  console.log(chalk.cyan.bold('║                                                               ║'));
  console.log(chalk.cyan.bold('║') + chalk.green.bold('        🔨  BUILDING PRODUCTION BUNDLE  🔨              ') + chalk.cyan.bold('║'));
  console.log(chalk.cyan.bold('║                                                               ║'));
  console.log(chalk.cyan.bold('╚═══════════════════════════════════════════════════════════════╝'));
  console.log('\n');
};

const showBuildInfo = () => {
  const time = new Date().toLocaleTimeString('vi-VN');
  const date = new Date().toLocaleDateString('vi-VN');
  
  console.log(chalk.cyan.bold('📦 BUILD INFORMATION'));
  console.log(chalk.gray('─'.repeat(65)));
  console.log(chalk.white(`  Date:      ${chalk.green(date)}`));
  console.log(chalk.white(`  Time:      ${chalk.green(time)}`));
  console.log(chalk.white(`  Mode:      ${chalk.yellow('PRODUCTION')}`));
  console.log(chalk.white(`  Target:    ${chalk.green('dist/')}`));
  console.log(chalk.gray('─'.repeat(65)));
  console.log('\n');
};

const buildProject = () => {
  const spinner = ora({
    text: chalk.cyan('Compiling assets and optimizing bundle...'),
    spinner: {
      interval: 80,
      frames: ['⠋', '⠙', '⠹', '⠸', '⠼', '⠴', '⠦', '⠧', '⠇', '⠏']
    },
  }).start();

  try {
    execSync('npx vite build', {
      cwd: rootDir,
      stdio: 'pipe',
      encoding: 'utf-8',
    });

    spinner.succeed(chalk.green('Build completed successfully!'));
    return true;
  } catch (error) {
    spinner.fail(chalk.red('Build failed!'));
    console.log('\n');
    console.log(chalk.red('Error details:'));
    console.log(chalk.gray(error.message));
    return false;
  }
};

const showBuildStats = () => {
  try {
    const distPath = join(rootDir, 'dist');
    
    if (existsSync(distPath)) {
      const getSize = (dir) => {
        let size = 0;
        const files = readdirSync(dir);
        files.forEach(file => {
          const filePath = join(dir, file);
          const stat = statSync(filePath);
          if (stat.isDirectory()) {
            size += getSize(filePath);
          } else {
            size += stat.size;
          }
        });
        return size;
      };

      const totalSize = getSize(distPath);
      const sizeInMB = (totalSize / (1024 * 1024)).toFixed(2);
      
      console.log(chalk.cyan.bold('📊 BUILD STATISTICS'));
      console.log(chalk.gray('─'.repeat(65)));
      console.log(chalk.white(`  Output:    ${chalk.green('dist/')}`));
      console.log(chalk.white(`  Size:      ${chalk.green(sizeInMB + ' MB')}`));
      console.log(chalk.gray('─'.repeat(65)));
      console.log('\n');
    }
  } catch (error) {
    // Ignore if fs is not available
  }
};

const showSuccess = () => {
  console.log(chalk.green.bold('╔═══════════════════════════════════════════════════════════════╗'));
  console.log(chalk.green.bold('║') + chalk.white.bold('  ✅  BUILD SUCCESSFUL - PRODUCTION READY!                ') + chalk.green.bold('║'));
  console.log(chalk.green.bold('╚═══════════════════════════════════════════════════════════════╝'));
  console.log('\n');
  console.log(chalk.cyan('💡 Next steps:'));
  console.log(chalk.white('   • Run ') + chalk.yellow.bold('npm run preview') + chalk.white(' to preview the build'));
  console.log(chalk.white('   • Run ') + chalk.yellow.bold('npm run deploy') + chalk.white(' to deploy to Firebase'));
  console.log('\n');
};

const main = () => {
  banner();
  showBuildInfo();
  
  const success = buildProject();
  
  if (success) {
    showBuildStats();
    showSuccess();
  } else {
    console.log('\n');
    console.log(chalk.red.bold('╔═══════════════════════════════════════════════════════════════╗'));
    console.log(chalk.red.bold('║') + chalk.white.bold('  ❌  BUILD FAILED - CHECK ERRORS ABOVE                   ') + chalk.red.bold('║'));
    console.log(chalk.red.bold('╚═══════════════════════════════════════════════════════════════╝'));
    console.log('\n');
    process.exit(1);
  }
};

main();

