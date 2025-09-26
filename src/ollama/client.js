import { execa } from 'execa';
import { Marked } from 'marked';
import { markedTerminal } from 'marked-terminal';
import { highlight } from 'cli-highlight';
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
    
    const spinnerChars = ['⠙', '⠘', '⠰', '⠴', '⠤', '⠦', '⠆', '⠃', '⠋', '⠉'];
    let i = 0;
    const spinnerInterval = setInterval(() => {
        const spinner = spinnerChars[i++ % spinnerChars.length];
        outputBox.setContent(`{cyan-fg} {bold}${spinner} Algor is thinking...{bold}{cyan-fg}`);
        outputBox.screen.render();
    }, 80);

    try {
        const { stdout } = await execa('ollama', ['run', 'comethrusws/sage-reasoning:3b', finalPrompt]);
        clearInterval(spinnerInterval);
        const formattedOutput = marked.parse(stdout);
        outputBox.setContent(chalk.bold.green('Algor:') + `\n${formattedOutput}`);

    } catch (error) {
        clearInterval(spinnerInterval);
        const errorMessage = error.stderr || error.message;
        showError(`${chalk.red('Error communicating with Ollama:')}\n${errorMessage}\nPlease ensure Ollama is running and the model \`comethrusws/sage-reasoning:3b\` is installed.`);
    } finally {
        outputBox.screen.render();
    }
};
