export const isDev = (() => {
if (typeof window === 'undefined') return false;
const host = window.location.hostname;
return host === 'localhost' ||
host === '127.0.0.1' ||
host === '0.0.0.0' ||
host.endsWith('.local') ||
window.localStorage.getItem('hmt_debug') === 'true';
})();
export const logger = {
log:   (...args) => { if (isDev && window.console?.log) console.log(...args); },
info:  (...args) => { if (isDev && window.console?.info) console.info(...args); },
warn:  (...args) => { if (isDev && window.console?.warn) console.warn(...args); },
error: (...args) => { if (isDev && window.console?.error) console.error(...args); },
debug: (...args) => { if (isDev && window.console?.debug) console.debug(...args); },
};