const asyncLocalStorage = require("./als.service");

// REMOVED: fs require and the mkdirSync block.
// Vercel is read-only, so we cannot create folders or write files.

function getTime() {
  let now = new Date();
  return now.toLocaleString("he");
}

function isError(e) {
  return e && e.stack && e.message;
}

function doLog(level, ...args) {
  const strs = args.map((arg) =>
    typeof arg === "string" || isError(arg) ? arg : JSON.stringify(arg),
  );

  var line = strs.join(" | ");
  const store = asyncLocalStorage.getStore();
  const userId = store?.loggedinUser?._id;
  const str = userId ? `(userId: ${userId})` : "";

  // Construct the final log message
  const finalLog = `${getTime()} - ${level} - ${line} ${str}`;

  // CHANGED: Use console.log / console.error directly.
  // Vercel captures these automatically and shows them in the logs tab.
  if (level === "ERROR") {
    console.error(finalLog);
  } else if (level === "WARN") {
    console.warn(finalLog);
  } else {
    console.log(finalLog);
  }
}

module.exports = {
  debug(...args) {
    // FIXED TYPO: You had 'NODE_NEV', changed to 'NODE_ENV'
    if (process.env.NODE_ENV === "production") return;
    doLog("DEBUG", ...args);
  },
  info(...args) {
    doLog("INFO", ...args);
  },
  warn(...args) {
    doLog("WARN", ...args);
  },
  error(...args) {
    doLog("ERROR", ...args);
  },
};
