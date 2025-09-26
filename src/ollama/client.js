import { execa } from 'execa';
import { Marked } from 'marked';
import { markedTerminal } from 'marked-terminal';
import { highlight } from 'cli-highlight';
import ora from 'ora';
import chalk from 'chalk';

const marked = new Marked(
    markedTerminal({
        highlight: (code, lang) => {
            return highlight(code, { language: lang, ignoreIllegals: true });
        }
    })
);

export const runOllama = async (prompt, outputBox, showError) => {
    const systemPrompt = "You are Algor, a CLI coding assistant. You are running in a REPL environment. Your output should be in markdown format.";
    const finalPrompt = `${systemPrompt}\n\nUser: ${prompt}`;
    
    const spinner = ora('Algor is thinking...').start();
    outputBox.setContent('Algor is thinking...');
    outputBox.screen.render();

    try {
        const { stdout } = await execa('ollama', ['run', 'comethrusws/sage-reasoning:3b', finalPrompt]);
        spinner.succeed(chalk.bold.green('Algor:'));
        const formattedOutput = marked.parse(stdout);
        outputBox.setContent(formattedOutput);

    } catch (error) {
        spinner.fail(chalk.red('Error communicating with Ollama:'));
        const errorMessage = error.stderr || error.message;
        showError(`${chalk.red('Error communicating with Ollama:')}\n${errorMessage}\nPlease ensure Ollama is running and the model \`comethrusws/sage-reasoning:3b\` is installed.`);
    } finally {
        outputBox.screen.render();
    }
};
