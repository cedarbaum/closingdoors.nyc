import rootLog, { LogLevelNames } from "loglevel";

const log = rootLog.getLogger("root_with_level_from_env");
const logLevel = (process.env.NEXT_PUBLIC_LOG_LEVEL || "info") as LogLevelNames;
log.setLevel(logLevel);

export default log;
