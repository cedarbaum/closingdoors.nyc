export function classNames(...args: any[]): string {
  const classes = [];

  for (const arg of args) {
    if (!arg) {
      continue;
    }

    if (typeof arg === 'string') {
      classes.push(arg);
    } else if (Array.isArray(arg)) {
      classes.push(classNames(...arg));
    } else if (typeof arg === 'object') {
      for (const key in arg) {
        if (arg.hasOwnProperty(key) && arg[key]) {
          classes.push(key);
        }
      }
    }
  }

  return classes.join(' ');
}
