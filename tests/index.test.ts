import { exec } from "child_process"
import fs from "fs-extra"
import { toMatchDirSnapshot } from "jest-dir-snapshot"
import { name, version } from "../package.json"

expect.extend({ toMatchDirSnapshot })

const tests = fs.readdirSync("./tests")
  .filter(f => f !== "__dir_snapshots__")
  .filter(f => fs.lstatSync(`./tests/${f}`).isDirectory() )

describe(`${name}@${version}`, () => {
  tests.forEach(test => {
    it(test, (done) => {
      const cwd = `./tests/${test}`
      const cmd = `rm -rf _site && yarn eleventy`
      exec(cmd, {
        cwd,
        shell: "/bin/sh",
      }, (error, stdout, stderr) => {
        const files = fs.readdirSync(`./tests/${test}/_site`)
        const output = files.reduce((acc, curr) => {
          return {
            ...acc,
            [curr]: fs.readFileSync(
              `./tests/${test}/_site/${curr}`,
              "utf-8",
            ),
          }
        }, {})
        // @ts-ignore
        expect(output).toMatchDirSnapshot({
          snapshotIdentifier: test,
        })
        done()
      })
    })
  })
})
