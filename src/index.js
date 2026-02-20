import { Command } from 'commander';
import chalk from 'chalk';
import ora from 'ora';
import { getConfig, setConfig } from './config.js';
import { sendVerification, verifyOtp } from './api.js';

const program = new Command();

// ============================================================
// Helpers
// ============================================================

function printSuccess(message) {
  console.log(chalk.green('✓') + ' ' + message);
}

function printError(message) {
  console.error(chalk.red('✗') + ' ' + message);
}

function printJson(data) {
  console.log(JSON.stringify(data, null, 2));
}

async function withSpinner(message, fn) {
  const spinner = ora(message).start();
  try {
    const result = await fn();
    spinner.stop();
    return result;
  } catch (error) {
    spinner.stop();
    throw error;
  }
}

// ============================================================
// Program metadata
// ============================================================

program
  .name('fraudlabspro')
  .description(chalk.bold('FraudLabs Pro CLI') + ' - SMS verification & fraud prevention from your terminal')
  .version('1.0.0');

// ============================================================
// CONFIG
// ============================================================

const configCmd = program.command('config').description('Manage CLI configuration');

configCmd
  .command('set')
  .description('Set configuration values')
  .option('--api-key <key>', 'FraudLabs Pro API key')
  .option('--base-url <url>', 'API base URL (default: https://api.fraudlabspro.com)')
  .action((options) => {
    if (options.apiKey) {
      setConfig('apiKey', options.apiKey);
      printSuccess('API key set');
    }
    if (options.baseUrl) {
      setConfig('baseUrl', options.baseUrl);
      printSuccess('Base URL set');
    }
    if (!options.apiKey && !options.baseUrl) {
      printError('No options provided. Use --api-key or --base-url');
    }
  });

configCmd
  .command('show')
  .description('Show current configuration')
  .action(() => {
    const apiKey = getConfig('apiKey');
    const baseUrl = getConfig('baseUrl') || 'https://api.fraudlabspro.com (default)';
    console.log(chalk.bold('\nFraudLabs Pro CLI Configuration\n'));
    console.log('API Key: ', apiKey ? chalk.cyan('***' + apiKey.slice(-8)) : chalk.yellow('(not set)'));
    console.log('Base URL: ', chalk.cyan(baseUrl));
    console.log('');
  });

// ============================================================
// SEND VERIFICATION
// ============================================================

program
  .command('send')
  .description('Send SMS verification code')
  .requiredOption('-t, --tel <number>', 'Mobile phone number in E164 format (e.g., +12025550123)')
  .option('-c, --country-code <code>', 'ISO 3166 country code (e.g., US, GB)')
  .option('-m, --mesg <message>', 'Custom SMS message with <otp> placeholder (max 140 chars)')
  .option('-k, --key <apikey>', 'API key (overrides config)')
  .option('--json', 'Output as JSON')
  .action(async (options) => {
    try {
      const params = {
        tel: options.tel
      };

      if (options.key) params.key = options.key;
      if (options.countryCode) params.country_code = options.countryCode;
      if (options.mesg) params.mesg = options.mesg;

      const data = await withSpinner('Sending verification code...', () => sendVerification(params));

      if (options.json) {
        printJson(data);
        return;
      }

      console.log(chalk.bold('\nSMS Verification Sent\n'));
      console.log('Transaction ID: ', chalk.cyan(data.tran_id || 'N/A'));
      console.log('Credits Balance: ', data.credits_balance || 'N/A');

      if (data.error) {
        console.log('Status: ', chalk.red('Error'));
        console.log('Error: ', chalk.red(data.error.error_message || 'Unknown error'));
      } else {
        console.log('Status: ', chalk.green('Success'));
      }
      console.log('');
    } catch (error) {
      printError(error.message);
      process.exit(1);
    }
  });

// ============================================================
// VERIFY OTP
// ============================================================

program
  .command('verify')
  .description('Verify OTP code')
  .requiredOption('-i, --tran-id <id>', 'Transaction ID from send command')
  .requiredOption('-o, --otp <code>', 'OTP code to verify')
  .option('-k, --key <apikey>', 'API key (overrides config)')
  .option('--json', 'Output as JSON')
  .action(async (options) => {
    try {
      const params = {
        tran_id: options.tranId,
        otp: options.otp
      };

      if (options.key) params.key = options.key;

      const data = await withSpinner('Verifying OTP...', () => verifyOtp(params));

      if (options.json) {
        printJson(data);
        return;
      }

      console.log(chalk.bold('\nOTP Verification Result\n'));
      console.log('Transaction ID: ', chalk.cyan(data.tran_id || 'N/A'));

      if (data.error) {
        console.log('Status: ', chalk.red('Failed'));
        console.log('Error: ', chalk.red(data.error.error_message || 'Unknown error'));
      } else if (data.result === 'Y') {
        console.log('Status: ', chalk.green('Verified'));
        console.log('Result: ', chalk.green('Valid OTP'));
      } else {
        console.log('Status: ', chalk.yellow('Invalid'));
        console.log('Result: ', chalk.yellow('OTP does not match'));
      }
      console.log('');
    } catch (error) {
      printError(error.message);
      process.exit(1);
    }
  });

// ============================================================
// Parse
// ============================================================

program.parse(process.argv);

if (process.argv.length <= 2) {
  program.help();
}
