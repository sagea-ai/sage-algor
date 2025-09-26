#!/usr/bin/env node

import chalk from 'chalk';
import inquirer from 'inquirer';
import { execa } from 'execa';
import ora from 'ora';
import { Marked } from 'marked';
import { markedTerminal } from 'marked-terminal';
import { highlight } from 'cli-highlight';

const printLogo = () => {
    const logoLines = [
        `███████╗ █████╗  ██████╗ ███████╗     █████╗ ██╗      ██████╗  ██████╗ ██████╗ `,
        `██╔════╝██╔══██╗██╔════╝ ██╔════╝    ██╔══██╗██║     ██╔════╝ ██╔═══██╗██╔══██╗`,
        `███████╗███████║██║  ███╗█████╗█████╗███████║██║     ██║  ███╗██║   ██║██████╔╝`,
        `╚════██║██╔══██║██║   ██║██╔══╝╚════╝██╔══██║██║     ██║   ██║██║   ██║██╔══██╗`,
        `███████║██║  ██║╚██████╔╝███████╗    ██║  ██║███████╗╚██████╔╝╚██████╔╝██║  ██║`,
        `╚══════╝╚═╝  ╚═╝ ╚═════╝ ╚══════╝    ╚═╝  ╚═╝╚══════╝ ╚═════╝  ╚═════╝ ╚═╝  ╚═╝`
    ];

    const termWidth = process.stdout.columns || 120;

    const startColor = { r: 0, g: 255, b: 255 }; // Cyan
    const endColor = { r: 0, g: 255, b: 0 };   // Green

    console.log('\n');
    logoLines.forEach((line, index) => {
        const ratio = index / (logoLines.length - 1);
        const r = Math.round(startColor.r + ratio * (endColor.r - startColor.r));
        const g = Math.round(startColor.g + ratio * (endColor.g - startColor.g));
        const b = Math.round(startColor.b + ratio * (endColor.b - startColor.b));

        let truncatedLine = line.length > termWidth ? line.substring(0, termWidth) : line;
        console.log(chalk.rgb(r, g, b)(truncatedLine));
    });
    console.log('\n');
};

const marked = new Marked(
    markedTerminal({
        highlight: (code, lang) => {
            return highlight(code, { language: lang, ignoreIllegals: true });
        }
    })
);

const runOllama = async (prompt) => {
    const systemPrompt = "You are Algor, a CLI coding assistant. You are running in a REPL environment. Your output should be in markdown format.";
    const finalPrompt = `${systemPrompt}\n\nUser: ${prompt}`;
    
    const spinner = ora('Algor is thinking...').start();

    try {
        const { stdout } = await execa('ollama', ['run', 'comethrusws/sage-reasoning:3b', finalPrompt]);
        spinner.succeed(chalk.bold.green('Algor:'));
        console.log(marked.parse(stdout));

    } catch (error) {
        spinner.fail(chalk.red('Error communicating with Ollama:'));
        console.error(error.stderr || error.message);
        console.error(chalk.red('Please ensure Ollama is running and the model `comethrusws/sage-reasoning:3b` is installed.'));
    }
};

const handleCommand = (line) => {
    const parts = line.trim().split(' ');
    const command = parts[0];
    const args = parts.slice(1);

    switch (command) {
        case ':edit':
            console.log(chalk.blue(`Loading ${args.join(' ')} into context... (Not implemented)`));
            break;
        case ':run':
            console.log(chalk.blue(`Running ${args.join(' ')}... (Not implemented)`));
            break;
        case ':test':
            console.log(chalk.blue(`Testing ${args.join(' ')}... (Not implemented)`));
            break;
        case ':history':
            console.log(chalk.blue('Displaying history... (Not implemented)'));
            break;
        case 'exit':
        case 'quit':
            console.log(chalk.yellow('Exiting Algor. Goodbye!'));
            process.exit(0);
        default:
            console.log(chalk.bold.cyan('You:'));
            console.log(line + '\n');
            return runOllama(line);
    }
    return Promise.resolve();
};

const startRepl = () => {
    inquirer.prompt([
        {
            type: 'input',
            name: 'line',
            message: chalk.bold('>>'),
        },
    ]).then(async (answers) => {
        await handleCommand(answers.line);
        startRepl();
    });
};

const main = () => {
    printLogo();
    startRepl();
};

main();
