# Classtable2iCal Backend

后端代码实现参考了 [SunsetYe66/ClasstableToIcal](https://github.com/SunsetYe66/ClasstableToIcal)，在此表示感谢

## 工作目录结构

```
.
├── README
├── dist
│   └── index.js
├── package-lock.json
├── package.json
├── rollup.config.js
├── src
│   ├── ical_generator.ts
│   ├── index.ts
│   ├── tools_function.ts
│   └── week_generator.ts
└── tsconfig.json
```

## 部署

将 dist/index.js 部署在 Cloudflare Workers 或同类型服务上即可，通过带有 JSON 的 POST 请求获取 iCal 文件

## Curl

```
curl -X POST -d @simple.json -H 'Content-Type: application/json' test.yourname.workers.dev
```