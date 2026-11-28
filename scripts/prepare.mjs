// npm git 依赖安装钩：构建探针 jar 与 TS dist。
// 护栏（调度裁定）：任一环节失败必须非零退出 fail-fast——静默退空包会让
// 车道拿到缺 keypress/hud 的旧形状包，属『旧包冒充新包』静默退化，禁止。
import { execFileSync } from 'node:child_process'
import { existsSync } from 'node:fs'
import { fileURLToPath } from 'node:url'

const run = (cmd, args) => {
  try {
    execFileSync(cmd, args, { stdio: 'inherit', cwd: fileURLToPath(new URL('..', import.meta.url)) })
  } catch (e) {
    console.error(`[prepare] FAIL: ${cmd} ${args.join(' ')} 非零退出——构建失败，拒绝产出空包`)
    process.exit(1)
  }
}

run('node', ['scripts/build-probe.mjs'])
// tsc 走 node 直驱 bin/tsc——.bin 无扩展名 shim 是 POSIX 壳，Windows spawn 必 ENOENT
run(process.execPath, ['node_modules/typescript/bin/tsc', '-p', 'tsconfig.json'])

const must = ['vendor/calcite-probe.jar', 'dist/index.js']
for (const f of must) {
  if (!existsSync(new URL('../' + f, import.meta.url))) {
    console.error(`[prepare] FAIL: ${f} 缺失——构建产物不完整，拒绝产出空包`)
    process.exit(1)
  }
}
console.log('[prepare] 探针 jar 与 dist 构建完成')
