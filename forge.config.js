const { FusesPlugin } = require('@electron-forge/plugin-fuses');
const { FuseV1Options, FuseVersion } = require('@electron/fuses');
const fs = require('fs-extra');
const path = require('path');

module.exports = {
  packagerConfig: {
    name: 'Big Ds Railroad',
    executableName: 'Big Ds Railroad',
    icon: 'public/icon',
    // Only ignore source files, not node_modules (needed for runtime dependencies)
    ignore: (path) => {
      if (!path) return false;
      // Keep node_modules
      if (path.startsWith('/node_modules')) return false;
      // Keep .vite build output
      if (path.startsWith('/.vite')) return false;
      // Ignore everything else in the root
      return /^\/[^/]+$/.test(path) && !path.startsWith('/.vite');
    },
    // CRITICAL: Unpack native modules from ASAR so they can be loaded at runtime
    asar: {
      unpack: '**/node_modules/**/*.{node,dll,dylib,so}'
    },
    // Remove non-Windows prebuilt binaries to prevent signing errors
    afterCopy: [(buildPath, electronVersion, platform, arch, callback) => {
      if (platform !== 'win32') {
        callback();
        return;
      }

      try {
        console.log('🗑️  [afterCopy] Removing non-Windows prebuilt binaries...');

        // List of packages with prebuilds that need cleaning
        const packagesToClean = [
          ['@serialport', 'bindings-cpp'],
          ['usb']
        ];

        for (const packagePath of packagesToClean) {
          const prebuildsPath = path.join(buildPath, 'node_modules', ...packagePath, 'prebuilds');

          if (fs.existsSync(prebuildsPath)) {
            console.log(`   Cleaning: ${packagePath.join('/')}`);
            const entries = fs.readdirSync(prebuildsPath);

            for (const entry of entries) {
              // Keep only win32-* folders
              if (!entry.startsWith('win32-')) {
                const fullPath = path.join(prebuildsPath, entry);
                console.log(`      Removing: ${entry}`);
                fs.removeSync(fullPath);
              }
            }
          }
        }

        console.log('✓ [afterCopy] Non-Windows binaries removed successfully');
        callback();
      } catch (error) {
        console.error('❌ [afterCopy] Error removing binaries:', error);
        callback(error);
      }
    }],
    win32metadata: {
      CompanyName: 'WBM Tek',
      FileDescription: 'Big D\'s Railroad - DCC Control System',
      ProductName: 'Big Ds Railroad',
      InternalName: 'Big Ds Railroad',
      OriginalFilename: 'Big Ds Railroad.exe'
    }
  },
  rebuildConfig: {
    force: true,
  },
  makers: [
    {
      name: '@electron-forge/maker-wix',
      config: {
        name: 'Big Ds Railroad',
        manufacturer: 'WBM Tek',
        description: 'Big D\'s Railroad - DCC Control System',
        exe: 'Big Ds Railroad.exe',
        icon: 'public/icon.ico',
        upgradeCode: 'a1b2c3d4-e5f6-4a5b-8c9d-0e1f2a3b4c5d'
      },
    },
    {
      name: '@electron-forge/maker-zip',
      platforms: ['darwin'],
    },
  ],
  publishers: [
    {
      name: '@electron-forge/publisher-github',
      config: {
        repository: {
          owner: 'wbmmusic',
          name: 'dcc'
        },
        prerelease: false,
        draft: true
      }
    }
  ],
  plugins: [
    {
      name: '@electron-forge/plugin-vite',
      config: {
        build: [
          {
            entry: 'public/main.ts',
            config: 'vite.main.config.js',
          },
          {
            entry: 'public/preload.ts',
            config: 'vite.preload.config.js',
          },
        ],
        renderer: [
          {
            name: 'main_window',
            config: 'vite.renderer.config.js',
          },
        ],
      },
    },
    new FusesPlugin({
      version: FuseVersion.V1,
      [FuseV1Options.RunAsNode]: false,
      [FuseV1Options.EnableCookieEncryption]: true,
      [FuseV1Options.EnableNodeOptionsEnvironmentVariable]: false,
      [FuseV1Options.EnableNodeCliInspectArguments]: false,
      [FuseV1Options.EnableEmbeddedAsarIntegrityValidation]: false,
      [FuseV1Options.OnlyLoadAppFromAsar]: false,
    }),
  ],
};
