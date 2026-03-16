import chalk from 'chalk';

export function log(msg: string) {
  console.error(`${chalk.cyan('[e2e]')} ${msg}`);
}

export function pass(msg: string) {
  console.error(`${chalk.green('[PASS]')} ${msg}`);
}

export function fail(msg: string) {
  console.error(`${chalk.red('[FAIL]')} ${msg}`);
}

export function wait(msg: string) {
  console.error(`${chalk.yellow.bold('[WAIT]')} ${msg}`);
}

export function header(msg: string) {
  console.error('');
  log(chalk.bold(msg));
  log('================================================================');
}

export const bold = chalk.bold;

export function assert(
  condition: boolean,
  passMsg: string,
  failMsg: string,
): number {
  if (condition) {
    pass(passMsg);
    return 0;
  }
  fail(failMsg);
  return 1;
}

export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
