module.exports = function (api) {
    api.cache(true);
    return {
        presets: ['babel-preset-expo'],
        plugins: [
            'react-native-reanimated/plugin',
            [
                'module-resolver',
                {
                    alias: {
                        'react-native-vector-icons': './src/utils/react-native-vector-icons',
                        '@react-native-vector-icons/material-design-icons': './src/utils/react-native-vector-icons/MaterialCommunityIcons',
                    },
                },
            ],
        ],
    };
};
