const {
  configureAndroidEnvironment,
} = require('./scripts/android-environment');

// Loaded by `npx react-native run-android`, including Gradle autolinking.
configureAndroidEnvironment();

module.exports = {};
