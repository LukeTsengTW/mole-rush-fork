const isGitHubPages = process.env.GITHUB_ACTIONS === "true";

const nextConfig = {
  output: "export",
  trailingSlash: true,
  basePath: isGitHubPages ? "/mole-rush" : "",
  assetPrefix: isGitHubPages ? "/mole-rush" : "",
} as const;

export default nextConfig;
