const {getDefaultConfig, mergeConfig} = require('@react-native/metro-config');
const path = require('path');

/**
 * Metro configuration
 * https://reactnative.dev/docs/metro
 *
 * @type {import('metro-config').MetroConfig}
 */
const config = {
    resolver: {
        blockList: [
            new RegExp(
              `${path.resolve(__dirname, 'node_modules').replace(/\\/g, '/')}/.*/android/\\.cxx/.*`
            ),
            new RegExp(
              `${path.resolve(__dirname, 'node_modules').replace(/\\/g, '/')}/.*/android/build/.*`
            ),
        ],
    }
};

module.exports = mergeConfig(getDefaultConfig(__dirname), config);
