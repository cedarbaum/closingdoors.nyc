const fs = require("fs");

// Read the existing build.ts file
const existingContent = fs.readFileSync("./utils/build.ts", "utf8");

// Get the values from environment variables or keep them as null if not set
const gitCommitHash = process.env.VERCEL_GIT_COMMIT_SHA || null;
const gitBranch = process.env.VERCEL_GIT_COMMIT_REF || null;

// Construct the updated content
if (gitCommitHash && gitBranch) {
  const updatedContent = existingContent
    .replace(/\$\(GIT_COMMIT_HASH\)/, gitCommitHash)
    .replace(/\$\(GIT_BRANCH\)/, gitBranch);
  // Write back the updated content to the build.ts file
  fs.writeFileSync("./utils/build.ts", updatedContent);
  console.log("build.ts file updated successfully.");
} else {
  console.warn(
    "Git commit hash or branch not found. Please check the environment variables.",
  );
  return;
}
