const { getDefaultConfig } = require("expo/metro-config");
const path = require("path");

const config = getDefaultConfig(__dirname);

// Metro's resolver fails on leaflet's package.json "main" field
// ("dist/leaflet-src.js") even though the file exists — a known
// incompatibility between Metro and how leaflet publishes its package.
// Redirect it to the pre-bundled dist file directly.
const originalResolveRequest = config.resolver.resolveRequest;

config.resolver.resolveRequest = (context, moduleName, platform) => {
  if (moduleName === "leaflet") {
    return {
      type: "sourceFile",
      filePath: path.resolve(__dirname, "node_modules/leaflet/dist/leaflet-src.js"),
    };
  }
  if (originalResolveRequest) {
    return originalResolveRequest(context, moduleName, platform);
  }
  return context.resolveRequest(context, moduleName, platform);
};

module.exports = config;
