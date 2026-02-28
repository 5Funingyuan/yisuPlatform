const taroEnv = process.env.TARO_ENV
const apiBaseFromEnv = (process.env.TARO_APP_API_BASE || '').trim()
const weappDevApiBase = (process.env.TARO_APP_WEAPP_DEV_API_BASE || 'http://127.0.0.1:3001/api').trim()
const outputRoot =
  taroEnv === 'weapp'
    ? 'dist/weapp'
    : taroEnv === 'h5'
      ? 'dist/h5'
      : 'dist'

const config = {
  projectName: 'yisuPlatform',
  date: '2026-02-09',
  designWidth: 375,
  deviceRatio: {
    640: 2.34 / 2,
    375: 2 / 1,
    750: 1,
    828: 1.81 / 2,
  },
  sourceRoot: 'src',
  outputRoot,
  plugins: ['@tarojs/plugin-framework-react'],
  defineConstants: {
    __YISU_API_BASE__: JSON.stringify(apiBaseFromEnv),
    __YISU_WEAPP_DEV_API_BASE__: JSON.stringify(weappDevApiBase),
  },
  copy: {
    patterns: [],
    options: {},
  },
  framework: 'react',
  compiler: {
    type: 'webpack5',
    prebundle: {
      enable: false,
    },
  },
  cache: {
    enable: true,
  },
  mini: {
    postcss: {
      pxtransform: {
        enable: true,
        config: {},
      },
      autoprefixer: {
        enable: true,
        config: {},
      },
    },
  },
  h5: {
    publicPath: '/',
    staticDirectory: 'static',
    postcss: {
      pxtransform: {
        enable: true,
        config: {},
      },
      autoprefixer: {
        enable: true,
        config: {},
      },
    },
    devServer: {
      port: 10087,
      host: '0.0.0.0',
      allowedHosts: 'all',
    },
  },
}

module.exports = function (merge) {
  if (process.env.NODE_ENV === 'development') {
    return merge({}, config, require('./dev'))
  }
  return merge({}, config, require('./prod'))
}
