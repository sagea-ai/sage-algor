
import chalk from 'chalk';

export const formatPrompt = (prompt) => {
    const promptLine = `│  > ${prompt}  │`;
    const topBorder = `╭${'─'.repeat(promptLine.length - 2)}╮`;
    const bottomBorder = chalk.cyan(`╰${'─'.repeat(promptLine.length - 2)}╯`);
    return `
${topBorder}
${promptLine}
${bottomBorder}
`;
};

export const formatResponse = (response) => {
    return ` ${chalk.cyan('✦')} ${chalk.white(response)}`;
};

