/* eslint-env jest */
const {
  configureAndroidEnvironment,
} = require('../scripts/android-environment');

test('Windows: stale terminal discovers SDK/JDK without fixed user paths', () => {
  const env = {
    LOCALAPPDATA: 'C:\\Users\\Alice\\AppData\\Local',
    ProgramFiles: 'C:\\Program Files',
    Path: 'C:\\Windows\\System32',
  };
  const sdk = 'C:\\Users\\Alice\\AppData\\Local\\Android\\Sdk';
  const java = 'C:\\Program Files\\Microsoft\\jdk-17.0.21';
  const existing = new Set([
    `${sdk}\\platform-tools\\adb.exe`,
    `${sdk}\\platform-tools`,
    `${sdk}\\emulator`,
    `${java}\\bin\\java.exe`,
    `${java}\\bin`,
  ]);
  configureAndroidEnvironment({
    env,
    platform: 'win32',
    home: 'C:\\Users\\Alice',
    exists: candidate => existing.has(candidate),
    directories: directory =>
      directory === 'C:\\Program Files\\Microsoft' ? ['jdk-17.0.21'] : [],
  });
  expect(env.ANDROID_HOME).toBe(sdk);
  expect(env.JAVA_HOME).toBe(java);
  expect(env.Path).toContain(`${sdk}\\platform-tools`);
  expect(env.PATH).toBeUndefined();
  expect(env.Path.split(';')[0]).toBe(`${java}\\bin`);
});

test('explicit environment values are preserved and PATH stays deduplicated', () => {
  const env = {
    JAVA_HOME: 'D:\\Java',
    ANDROID_HOME: 'D:\\Sdk',
    Path: 'D:\\Sdk\\platform-tools;C:\\Windows',
  };
  const options = {
    env,
    platform: 'win32',
    exists: () => true,
    directories: () => [],
  };
  configureAndroidEnvironment(options);
  const once = env.Path;
  configureAndroidEnvironment(options);
  expect(env.JAVA_HOME).toBe('D:\\Java');
  expect(env.ANDROID_HOME).toBe('D:\\Sdk');
  expect(env.Path).toBe(once);
  expect(env.Path.match(/platform-tools/g)).toHaveLength(1);
});

test.each([
  ['darwin', '/Users/alice', '/Users/alice/Library/Android/sdk'],
  ['linux', '/home/alice', '/home/alice/Android/Sdk'],
])('%s: discovers the conventional SDK location', (platform, home, sdk) => {
  const env = { PATH: '/usr/bin' };
  configureAndroidEnvironment({
    env,
    platform,
    home,
    exists: candidate =>
      candidate === `${sdk}/platform-tools/adb` ||
      candidate === `${sdk}/platform-tools`,
  });
  expect(env.ANDROID_HOME).toBe(sdk);
  expect(env.PATH).toBe(`${sdk}/platform-tools:/usr/bin`);
  expect(env.JAVA_HOME).toBeUndefined();
});

test('missing tools are not invented or written to system settings', () => {
  const env = { Path: 'C:\\Windows', ProgramFiles: 'C:\\Program Files' };
  configureAndroidEnvironment({
    env,
    platform: 'win32',
    exists: () => false,
    directories: () => [],
  });
  expect(env.ANDROID_HOME).toBeUndefined();
  expect(env.JAVA_HOME).toBeUndefined();
  expect(env.Path).toBe('C:\\Windows');
});
