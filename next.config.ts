const isGitHubPages = process.env.GITHUB_ACTIONS === "true";

const nextConfig = {
  output: "export",
  trailingSlash: true,

  // GitHub Pages 的 JS / CSS / _next 資源需要此前綴
  assetPrefix: isGitHubPages ? "/mole-rush" : "",
} as const;

export default nextConfig;
