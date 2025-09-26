import blessed from 'blessed';
import { printLogo } from './ui/logo.js';
import { handleCommand } from './commands/handler.js';
import chalk from 'chalk';
import fs from 'fs/promises';
import path from 'path';

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

    const quickStartContent = `{bold}Quick Start{/bold}\n` +
        `1. Ask questions, edit files, or run commands.\n` +
        `2. Be specific for the best results.\n` +
        `3. Create {red-fg}SAGE.md{/red-fg} files to customize your interactions with {blue-fg}SAGE.{/blue-fg}\n` +
        `4.{red-fg}/help{/red-fg} for more information.`;

    // Tips Box
    const tipsBox = blessed.box({
        parent: screen,
        tags: true,
        top: 8,
        left: 0,
        width: '100%',
        height: '100%-12',
        content: quickStartContent,
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
        tags: true,
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

    // Error Box
    const errorBox = blessed.box({
        parent: screen,
        bottom: 4,
        left: 'center',
        width: '80%',
        height: 4,
        border: 'line',
        style: {
            border: {
                fg: 'red',
            },
        },
        tags: true,
        hidden: true,
    });

    const showError = (message) => {
        errorBox.setContent(message);
        errorBox.show();
        screen.render();
        setTimeout(() => {
            errorBox.hide();
            screen.render();
        }, 5000); // Hide after 5 seconds
    };

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

    const history = [];
    let historyIndex = 0;

    let readyToExit = false;
    let exitTimeout = null;

    const cancelExit = () => {
        if (readyToExit) {
            readyToExit = false;
            clearTimeout(exitTimeout);
            updateStatus();
        }
    }

    // Handle exit
    screen.key(['escape', 'q'], (ch, key) => {
        return process.exit(0);
    });
    inputBox.key(['escape', 'q'], (ch, key) => {
        return process.exit(0);
    });

    const handleCtrlC = () => {
        if (readyToExit) {
            return;
        }
        readyToExit = true;
        statusBar.setContent('{red-fg}Press (c) to exit. Any other key to cancel.{/red-fg}');
        screen.render();
        exitTimeout = setTimeout(() => {
            cancelExit();
        }, 2000);
    };

    screen.key('C-c', handleCtrlC);
    inputBox.key('C-c', handleCtrlC);

    screen.on('keypress', (ch, key) => {
        if (readyToExit) {
            if (key.name === 'c' && !key.ctrl) {
                return process.exit(0);
            }
            // Don't cancel on the Ctrl+C that triggered the exit mode
            if (key.name === 'c' && key.ctrl) {
                return;
            }
            cancelExit();
        }
    });

    // Handle Ctrl+L to clear screen
    inputBox.key(['C-l'], (ch, key) => {
        tipsBox.setContent('');
        screen.render();
    });

    const fileList = blessed.list({
        parent: screen,
        bottom: 4,
        left: 0,
        width: '100%',
        height: 10,
        border: 'line',
        style: {
            border: {
                fg: 'blue',
            },
            selected: {
                bg: 'blue',
            },
        },
        hidden: true,
        keys: true,
        mouse: true,
        vi: true,
    });

    const showRecommendations = async (query = '') => {
        try {
            const getFiles = async (dir) => {
                const dirents = await fs.readdir(dir, { withFileTypes: true });
                const files = await Promise.all(dirents.map((dirent) => {
                    const res = path.resolve(dir, dirent.name);
                    return dirent.isDirectory() ? getFiles(res) : res;
                }));
                return Array.prototype.concat(...files);
            }

            const files = await getFiles(process.cwd());
            const relativeFiles = files.map(file => path.relative(process.cwd(), file));

            const filteredFiles = relativeFiles.filter(file => file.startsWith(query));

            if (filteredFiles.length > 0) {
                fileList.setItems(filteredFiles);
                fileList.show();
                screen.render();
            } else {
                fileList.hide();
                screen.render();
            }
        } catch (error) {
            showError(`Error reading directory: ${error.message}`);
        }
    };

    inputBox.on('keypress', (ch, key) => {
        const value = inputBox.getValue();
        if (fileList.visible && ['up', 'down'].includes(key.name)) {
            fileList.focus();
            return;
        }

        if (value.includes('@')) {
            const query = value.substring(value.lastIndexOf('@') + 1);
            showRecommendations(query);
        } else {
            fileList.hide();
            screen.render();
        }
    });

    fileList.on('select', (item) => {
        const value = inputBox.getValue();
        const lastAt = value.lastIndexOf('@');
        const newValue = value.substring(0, lastAt) + `{green-fg}${item.getText()}{/green-fg}`;
        inputBox.setValue(newValue);
        fileList.hide();
        inputBox.focus();
        screen.render();
    });

    inputBox.key(['up', 'down'], (ch, key) => {
        if (fileList.visible) {
            fileList.focus();
            if (key.name === 'up') fileList.up(1);
            if (key.name === 'down') fileList.down(1);
            screen.render();
            return;
        }

        if (key.name === 'up') {
            if (historyIndex > 0) {
                historyIndex--;
                inputBox.setValue(history[historyIndex]);
                screen.render();
            }
        } else if (key.name === 'down') {
            if (historyIndex < history.length - 1) {
                historyIndex++;
                inputBox.setValue(history[historyIndex]);
                screen.render();
            } else {
                historyIndex = history.length;
                inputBox.clearValue();
                screen.render();
            }
        }
    });

    // Handle input
    inputBox.on('submit', (line) => {
        if (fileList.visible) {
            fileList.enterSelected();
            return;
        }
        const cleanLine = line.replace(/\{green-fg\}|\{\/green-fg\}/g, '');
        if (cleanLine.trim()) {
            history.push(cleanLine);
            historyIndex = history.length;
            handleCommand(cleanLine, tipsBox, showError, quickStartContent, inputBox);
        }
        inputBox.clearValue();
        inputBox.focus();
        screen.render();
    });

    inputBox.focus();
    screen.render();
};
