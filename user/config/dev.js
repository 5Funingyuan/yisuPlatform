module.exports = {
  logger: {
    quiet: false,
    stats: true,
  },
  h5: {
    devServer: {
      hot: false,
      proxy: {
        '/api': {
          target: 'http://localhost:3001',
          changeOrigin: true,
        },
      },
      client: {
        overlay: {
          errors: true,
          warnings: false,
        },
      },
    },
    webpackChain(chain) {
      chain.merge({
        output: {
          environment: {
            asyncFunction: true,
          },
        },
        ignoreWarnings: [
          /webpackExports/,
          /taro_app_library@\/remoteEntry\.js/,
        ],
      })
    },
  },
}
