const { getDefaultConfig } = require('@expo/metro-config')

module.exports = (async () => {
  const defaultConfig = getDefaultConfig(__dirname)

  // Add 'cjs' to sourceExts if needed
  defaultConfig.resolver.sourceExts.push('cjs')

  // Modify the resolver to include resolverMainFields
  defaultConfig.resolver.resolverMainFields = ['react-native', 'browser', 'main']

  return defaultConfig
})()
