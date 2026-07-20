module.exports = function (api) {
  api.cache(true);
  // babel-preset-expo (SDK 57) auto-configures the Reanimated/Worklets babel
  // plugin when react-native-reanimated is installed — no manual plugin needed,
  // and adding it manually would double-apply it. This is the officially tested
  // setup, incl. react-native-web.
  return {
    presets: ['babel-preset-expo'],
  };
};
