const path = require('path');
const {
    override,
    disableEsLint,
    fixBabelImports,
    addLessLoader,
    addWebpackAlias,
} = require('customize-cra');
const theme = require('./src/theme');

const modifyVars = {};
Object.keys(theme).forEach((key) => {
    modifyVars[`@${key.replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase()}`] = theme[key];
});

const config = {
    webpack: override(
        disableEsLint(),
        addWebpackAlias({
            '@': path.resolve(__dirname, 'src')
        }),
        fixBabelImports('import', {
            libraryName: 'antd',
            libraryDirectory: 'es',
            style: true,
        }),
        addLessLoader({
            javascriptEnabled: true,
            modifyVars
        }),
        ((config) => {
            config.module.rules.forEach((rule) => {
                if (!rule.oneOf) {
                    return;
                }
                rule.oneOf.forEach((rule) => {
                    if (!rule.use) {
                        return;
                    }
                    rule.use.forEach((loader) => {
                        if (loader.options && loader.options.localIdentName) {
                            const { localIdentName } = loader.options;
                            delete loader.options.localIdentName;
                            loader.options.modules = { localIdentName };
                        }
                    });
                });
            });

            return config;
        }),
    ),
    devServer: (configFunction) => {
        return (proxy, allowedHost) => {
            const config = configFunction(proxy, allowedHost);
            config.proxy = {
                '/api': {
                    target: 'http://localhost:3030',
                    pathRewrite: { '^/api': '' }
                }
            };
            return config;
        };
    },
};

module.exports = config;
