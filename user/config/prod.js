module.exports = {
  mini: {},
  h5: {
    webpackChain(chain) {
      chain.optimization.runtimeChunk('single')
      chain.optimization.splitChunks({
        chunks: 'all',
        minSize: 20 * 1024,
        minChunks: 1,
        maxAsyncRequests: 40,
        maxInitialRequests: 30,
        automaticNameDelimiter: '.',
        cacheGroups: {
          taroVendor: {
            test: /[\\/]node_modules[\\/]@tarojs[\\/]/,
            name: 'vendor.taro',
            priority: 50,
            reuseExistingChunk: true,
          },
          reactVendor: {
            test: /[\\/]node_modules[\\/](react|react-dom|scheduler|use-sync-external-store)[\\/]/,
            name: 'vendor.react',
            priority: 45,
            reuseExistingChunk: true,
          },
          antdVendor: {
            test: /[\\/]node_modules[\\/](antd|@ant-design|@rc-component|rc-[^\\/]+)[\\/]/,
            name: 'vendor.antd',
            priority: 40,
            reuseExistingChunk: true,
          },
          stateVendor: {
            test: /[\\/]node_modules[\\/](zustand|immer)[\\/]/,
            name: 'vendor.state',
            priority: 35,
            reuseExistingChunk: true,
          },
          sharedCommon: {
            name: 'shared.common',
            minChunks: 2,
            priority: 20,
            reuseExistingChunk: true,
          },
        },
      })
    },
  },
}
