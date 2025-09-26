import { execa } from 'execa';
import os from 'os';
import ora from 'ora';
import chalk from 'chalk';

const installOllama = async () => {
    const platform = os.platform();
    const spinner = ora('Installing Ollama...').start();

    try {
        if (platform === 'darwin' || platform === 'linux') {
            spinner.text = 'Downloading and running Ollama installation script...';
            await execa('curl -fsSL https://ollama.com/install.sh | sh', { shell: true });
            spinner.succeed('Ollama installed successfully.');
        } else if (platform === 'win32') {
            spinner.warn(chalk.yellow('Ollama requires manual installation on Windows.'));
            console.log(chalk.cyan('Please download and install Ollama from: https://ollama.com/download'));
            // we can't proceed automatically on Windows.
            return;
        } else {
            spinner.fail(`Unsupported platform: ${platform}`);
            return;
        }
    } catch (error) {
        spinner.fail('Failed to install Ollama.');
        console.error(error);
        throw error; // re-throw to stop the process
    }
};

const pullModel = async () => {
    const spinner = ora('Pulling Ollama model (comethrusws/sage-reasoning:3b)...').start();
    try {
        await execa('ollama', ['pull', 'comethrusws/sage-reasoning:3b']);
        spinner.succeed('Model pulled successfully.');
    } catch (error) {
        spinner.fail('Failed to pull model.');
        console.error(error);
        throw error;
    }
};

const main = async () => {
    try {
        // check if we have  ollama installed
        await execa('ollama', ['--version']);
        console.log('Ollama is already installed.');
    } catch (error) {
        // Ollama not found, let's install it
        await installOllama();
    }

    await pullModel();
};

main().catch(() => process.exit(1));
