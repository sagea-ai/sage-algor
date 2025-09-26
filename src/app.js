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

    // Tips Box
    const tipsBox = blessed.box({
        parent: screen,
        label: '{bold}Quick Start{/bold}',
        tags: true,
        top: 8,
        left: 0,
        width: '100%',
        height: '100%-12',
        content: '\n1. Ask questions, edit files, or run commands.\n2. Be specific for the best results.\n3. Create SAGE.md files to customize your interactions with Gemini.\n4. /help for more information.',
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
        bottom: 1,
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

    // Status Bar
    const statusBar = blessed.box({
        parent: screen,
        bottom: 0,
        left: 0,
        width: '100%',
        height: 1,
        tags: true,
    });

    const updateStatus = () => {
        const left = `{cyan-fg}${process.cwd()}{/cyan-fg}`;
        const middle = `Sandbox Initialised (see /docs)`;
        const right = `{green-fg}SAGE v1{/green-fg}`;
        const rightText = `SAGE v1`;

        const middle_padding = Math.max(0, Math.floor((screen.width - middle.length) / 2) - process.cwd().length);
        const right_padding = Math.max(0, screen.width - (process.cwd().length + middle_padding + middle.length + rightText.length));

        statusBar.setContent(left + " ".repeat(middle_padding) + `{white-fg}${middle}{/white-fg}` + " ".repeat(right_padding) + right);
        screen.render();
    };

    updateStatus();
    screen.on('resize', updateStatus);

    // Handle exit
    screen.key(['escape', 'q', 'C-c'], (ch, key) => {
        return process.exit(0);
    });

    // Handle input
    inputBox.on('submit', (line) => {
        if (line.trim()) {
            handleCommand(line, tipsBox);
        }
        inputBox.clearValue();
        inputBox.focus();
        screen.render();
    });

    inputBox.focus();
    screen.render();
};
