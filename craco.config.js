module.exports = {
  babel: {
    plugins: ["babel-plugin-styled-components"],
  },
  webpack: {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars,no-unused-vars
    configure: (webpackConfig, { env, paths }) => {
      const [
        parser,
        tsLoader,
        loadersObject,
        ...rules
      ] = webpackConfig.module.rules
      const { oneOf } = loadersObject
      return {
        ...webpackConfig,
        output: {
          publicPath: "/sso/",
        },
        devServer: {
          public: "localhost:3001/sso/",
        },
        module: {
          ...webpackConfig.module,
          rules: [
            parser,
            tsLoader,
            {
              oneOf: [
                {
                  test: /\.svg$/,
                  use: [
                    {
                      loader: "svg-sprite-loader",
                    },
                    "svgo-loader",
                  ],
                },
                ...oneOf,
              ],
            },
            ...rules,
          ],
        },
      }
    },
  },
}
