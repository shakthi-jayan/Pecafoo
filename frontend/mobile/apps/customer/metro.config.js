const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

// Workspace root
const workspaceRoot = path.resolve(__dirname, '../..');

const config = getDefaultConfig(__dirname);

// Watch shared packages for live reloading
config.watchFolders = [workspaceRoot];

// Resolve modules from both app and workspace root
config.resolver.nodeModulesPaths = [
  path.resolve(__dirname, 'node_modules'),
  path.resolve(workspaceRoot, 'node_modules'),
];

// Ensure we don't get duplicate React instances

module.exports = config;
