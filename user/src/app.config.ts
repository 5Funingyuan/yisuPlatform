export default {
  pages: ['pages/query/index', 'pages/list/index', 'pages/detail/index', 'pages/filter/index'],
  permission: {
    'scope.userLocation': {
      desc: '用于为你推荐附近酒店与定位周边房源',
    },
  },
  window: {
    backgroundTextStyle: 'light',
    navigationBarBackgroundColor: '#ffffff',
    navigationBarTitleText: '易宿平台',
    navigationBarTextStyle: 'black',
  },
}
