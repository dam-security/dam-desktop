const { FusesPlugin } = require('@electron-forge/plugin-fuses');
const { FuseV1Options, FuseVersion } = require('@electron/fuses');

module.exports = {
  packagerConfig: {
    asar: true,
    icon: './assets/icon',
    name: 'DAM Desktop',
    executableName: 'dam-desktop',
    appBundleId: 'com.dam.desktop',
    appCategoryType: 'public.app-category.business',
    darwinDarkModeSupport: true,
    protocols: [
      {
        name: 'DAM Desktop',
        schemes: ['dam-desktop']
      }
    ]
  },
  rebuildConfig: {},
  makers: [
    {
      name: '@electron-forge/maker-squirrel',
      config: {
        name: 'dam-desktop',
        setupExe: 'DAM-Desktop-Setup.exe',
        setupIcon: './assets/icon.ico'
      },
    },
    {
      name: '@electron-forge/maker-zip',
      platforms: ['darwin'],
    },
    {
      name: '@electron-forge/maker-deb',
      config: {
        options: {
          maintainer: 'DAM AI',
          homepage: 'https://dam.ai',
          description: 'Enterprise AI Usage Intelligence Platform'
        }
      },
    },
    {
      name: '@electron-forge/maker-rpm',
      config: {
        options: {
          maintainer: 'DAM AI',
          homepage: 'https://dam.ai',
          description: 'Enterprise AI Usage Intelligence Platform'
        }
      },
    },
  ],
  plugins: [
    new FusesPlugin({
      version: FuseVersion.V1,
      [FuseV1Options.RunAsNode]: false,
      [FuseV1Options.EnableCookieEncryption]: true,
      [FuseV1Options.EnableNodeOptionsEnvironmentVariable]: false,
      [FuseV1Options.EnableNodeCliInspectArguments]: false,
      [FuseV1Options.EnableEmbeddedAsarIntegrityValidation]: true,
      [FuseV1Options.OnlyLoadAppFromAsar]: true,
    }),
  ],
};