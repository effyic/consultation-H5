import {fileURLToPath, URL} from 'node:url'
import vue from '@vitejs/plugin-vue'
import postcsspxtoviewport8plugin from 'postcss-px-to-viewport-8-plugin'
import AutoImport from 'unplugin-auto-import/vite'
import {VantResolver} from 'unplugin-vue-components/resolvers'
import Components from 'unplugin-vue-components/vite'
import {defineConfig} from 'vite'
import path from "node:path";
import { createSvgIconsPlugin } from 'vite-plugin-svg-icons'

// https://vite.dev/config/
export default defineConfig({
    server: {
        host: true,
        port: 8080,
        proxy: {
            '/api': {
                target: 'http://172.16.1.24:30137',
                // target: 'http://192.168.0.160:8080/',
                changeOrigin: true,
            },
        },
    },
    plugins: [
        vue(),
        createSvgIconsPlugin({
            // Specify the icon folder to be cached
            iconDirs: [path.resolve(process.cwd(), 'src/assets/icon')],
            // Specify symbolId format
            symbolId: 'icon-[dir]-[name]',
        }),
        AutoImport({
            resolvers: [VantResolver()],
        }),
        Components({
            resolvers: [VantResolver()],
        })
    ],
    css: {
        postcss: {
            plugins: [
                postcsspxtoviewport8plugin({
                    viewportWidth: 375, // 视窗的宽度，对应的是我们设计稿的宽度，一般是750
                    unitPrecision: 3, // 指定`px`转换为视窗单位值的小数位数（很多时候无法整除）
                    viewportUnit: 'vw', // 指定需要转换成的视窗单位，建议使用vw
                    selectorBlackList: [], // 指定不转换为视窗单位的类，可以自定义，可以无限添加,建议定义一至两个通用的类名
                    exclude: [/node_modules/], // If value is regexp, will ignore the matches files.If value is array, the elements of the array are regexp.
                    minPixelValue: 1, // 小于或等于`1px`不转换为视窗单位，你也可以设置为你想要的值
                    mediaQuery: false, // 允许在媒体查询中转换`px`
                }),
            ],
        },
    },
    resolve: {
        alias: {
            '@': fileURLToPath(new URL('./src', import.meta.url)),
        },
    },
})
