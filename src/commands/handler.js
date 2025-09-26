import chalk from 'chalk';
import { runOllama } from '../ollama/client.js';

export const handleCommand = (line, outputBox, showError) => {
    const parts = line.trim().split(' ');
    const command = parts[0];
    const args = parts.slice(1);

    switch (command) {
        case '/help':
            const helpMessage = `
Available commands:
/help                - Display this help message.
/edit <file>         - Load a file into the context (Not implemented).
/run <command>       - Run a command (Not implemented).
/test <file>         - Run tests for a file (Not implemented).
/history             - Display command history (Not implemented).
exit, quit           - Exit the application.
`;
            outputBox.setContent(helpMessage);
            break;
        case '/edit':
            outputBox.setContent(chalk.blue(`Loading ${args.join(' ')} into context... (Not implemented)`));
            break;
        case '/run':
            outputBox.setContent(chalk.blue(`Running ${args.join(' ')}... (Not implemented)`));
            break;
        case '/test':
            outputBox.setContent(chalk.blue(`Testing ${args.join(' ')}... (Not implemented)`));
            break;
        case '/history':
            outputBox.setContent(chalk.blue('Displaying history... (Not implemented)'));
            break;
        case 'exit':
        case 'quit':
            return process.exit(0);
        default:
            outputBox.setContent(chalk.bold.cyan('You:') + `
${line}
`);
            return runOllama(line, outputBox, showError);
    }
    outputBox.screen.render();
    return Promise.resolve();
};
