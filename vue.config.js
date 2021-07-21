module.exports = {
  chainWebpack: config =>{
      config.plugin('html')
        .tap(args => {
          args[0].title = "电气火灾检测系统";
          // args[0].keywords = "keywords内容";
          // args[0].description = "description内容";
          return args;
        })
    },
};