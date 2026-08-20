const isGitHubPages = process.env.GITHUB_ACTIONS === "true";

const nextConfig = {
  output: "export",
  trailingSlash: true,
  assetPrefix: isGitHubPages ? "/mole-rush" : "",
} as const;

export default nextConfig;
