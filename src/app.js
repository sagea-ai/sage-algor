import blessed from 'blessed';
import { printLogo } from './ui/logo.js';
import { handleCommand } from './commands/handler.js';
import chalk from 'chalk';

export const App = () => {
    const screen = blessed.screen({
        smartCSR: true,
        title: 'SAGE Algor',
        fullUnicode: true,
    });

    // Logo
    const logoBox = blessed.box({
        parent: screen,
        top: 0,
        left: 'center',
        width: '100%',
        height: 8,
        content: printLogo(),
        tags: true,
    });

    // Directory Box
    const dirBox = blessed.box({
        parent: screen,
        label: 'Current Directory',
        top: 8,
        left: 1,
        width: '30%',
        height: '80%',
        border: 'line',
        style: {
            border: {
                fg: 'cyan',
            },
        },
        content: process.cwd(),
    });

    // SAGE Reasoning Box
    const sageBox = blessed.box({
        parent: screen,
        label: 'SAGE Reasoning',
        top: 8,
        right: 1,
        width: '70%-2',
        height: '80%',
        border: 'line',
        style: {
            border: {
                fg: 'green',
            },
        },
        content: 'Welcome to SAGE Algor! Type your prompt below.',
        scrollable: true,
        alwaysScroll: true,
        scrollbar: {
          ch: ' ',
          inverse: true
        },
        mouse: true,
        keys: true,
        vi: true,
    });

    // Input Box
    const inputBox = blessed.textbox({
        parent: screen,
        bottom: 0,
        left: 0,
        width: '100%',
        height: 3,
        border: 'line',
        style: {
            border: {
                fg: 'magenta',
            },
            focus: {
                border: {
                    fg: 'yellow',
                }
            }
        },
        inputOnFocus: true,
        label: 'Input',
    });

    // Handle exit
    screen.key(['escape', 'q', 'C-c'], (ch, key) => {
        return process.exit(0);
    });

    // Handle input
    inputBox.on('submit', (line) => {
        if (line.trim()) {
            handleCommand(line, sageBox);
        }
        inputBox.clearValue();
        inputBox.focus();
        screen.render();
    });

    inputBox.focus();
    screen.render();
};
