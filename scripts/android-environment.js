const fs = require('fs');
const os = require('os');
const path = require('path');

// Configure this CLI process only. Do not change the user's system settings.
function configureAndroidEnvironment({
  env = process.env,
  platform = process.platform,
  home = os.homedir(),
  exists = fs.existsSync,
  directories = directory => {
    try {
      return fs.readdirSync(directory);
    } catch {
      return [];
    }
  },
} = {}) {
  const windows = platform === 'win32';
  const paths = windows ? path.win32 : path.posix;
  const sdkCandidates = [
    env.ANDROID_SDK_ROOT,
    windows &&
      env.LOCALAPPDATA &&
      paths.join(env.LOCALAPPDATA, 'Android', 'Sdk'),
    platform === 'darwin' && paths.join(home, 'Library', 'Android', 'sdk'),
    platform === 'linux' && paths.join(home, 'Android', 'Sdk'),
    platform === 'linux' && paths.join(home, 'Android', 'sdk'),
  ].filter(Boolean);
  if (!env.ANDROID_HOME) {
    const sdk = sdkCandidates.find(candidate =>
      exists(
        paths.join(candidate, 'platform-tools', windows ? 'adb.exe' : 'adb'),
      ),
    );
    if (sdk) {
      env.ANDROID_HOME = sdk;
    }
  }

  if (windows && !env.JAVA_HOME && env.ProgramFiles) {
    const vendors = ['Microsoft', 'Eclipse Adoptium', 'Java', 'Zulu'];
    for (const vendor of vendors) {
      const vendorRoot = paths.join(env.ProgramFiles, vendor);
      const jdk = directories(vendorRoot)
        .filter(name => /(?:jdk|zulu)[-_]?17(?:[.\-_]|$)/i.test(name))
        .sort()
        .reverse()
        .map(name => paths.join(vendorRoot, name))
        .find(candidate => exists(paths.join(candidate, 'bin', 'java.exe')));
      if (jdk) {
        env.JAVA_HOME = jdk;
        break;
      }
    }
  }

  const additions = [];
  if (env.JAVA_HOME) {
    additions.push(paths.join(env.JAVA_HOME, 'bin'));
  }
  if (env.ANDROID_HOME) {
    additions.push(
      paths.join(env.ANDROID_HOME, 'platform-tools'),
      paths.join(env.ANDROID_HOME, 'emulator'),
      paths.join(env.ANDROID_HOME, 'cmdline-tools', 'latest', 'bin'),
    );
  }
  const pathKey =
    Object.keys(env).find(key => key.toUpperCase() === 'PATH') || 'PATH';
  const separator = windows ? ';' : ':';
  const current = (env[pathKey] || '').split(separator).filter(Boolean);
  const combined = [...additions.filter(exists), ...current];
  env[pathKey] = [
    ...new Map(
      combined.map(entry => [windows ? entry.toLowerCase() : entry, entry]),
    ).values(),
  ].join(separator);
  return env;
}

module.exports = { configureAndroidEnvironment };
