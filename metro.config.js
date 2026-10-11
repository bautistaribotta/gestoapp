const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Los textos legales se importan como texto desde los .md de legal/, así hay una sola fuente.
config.transformer.babelTransformerPath = require.resolve('./markdown-transformer');
config.resolver.sourceExts.push('md');

module.exports = config;
