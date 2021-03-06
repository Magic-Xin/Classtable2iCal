import typescript from "rollup-plugin-typescript2";

export default {
    input: "src/index.ts",

    plugins: [
        typescript({
            tsconfig: "./tsconfig.json"
        })
    ],

    treeshake: false,

    output: {
        file: "./dist/index.js",
        format: "cjs",
        sourcemap: false
    }
}