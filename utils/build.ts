export const GIT_COMMIT_HASH = "$(GIT_COMMIT_HASH)";
export const GIT_BRANCH = "$(GIT_BRANCH)";

export function getBuildInfo() {
  return {
    GIT_COMMIT_HASH: GIT_COMMIT_HASH?.startsWith("$") ? null : GIT_COMMIT_HASH,
    GIT_BRANCH: GIT_BRANCH?.startsWith("$") ? null : GIT_BRANCH,
  };
}
