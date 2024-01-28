import assert from "assert"
import fs from "fs"
import path from "path"
import { parse } from "./parse"

function readFixture(...args: Array<string>): string {
  return fs.readFileSync(path.join(__dirname, "..", "..", "..", "fixtures", ...args), "utf8")
}

describe("parse.info", function () {
  it("should parse empty string", function () {
    assert.deepEqual(null, parse(""))
  })

  it("should parse string", function () {
    const infoEditStdout = readFixture("info-edit.txt")

    assert.deepEqual(
      {
        localInformation: {
          change: "edit",
          changeset: "950",
          localPath: "D:\\data\\prj\\server\\index.js",
          serverPath: "$/prj/server/index.js",
          type: "file",
        },
        serverInformation: {
          changeset: "950",
          deletionId: "0",
          fileType: "windows-1251",
          lastModified: "Thursday, October 19, 2017 22:34:18",
          lock: "none",
          lockOwner: "",
          serverPath: "$/prj/server/index.js",
          size: "2702",
          type: "file",
        },
      },
      parse(infoEditStdout)
    )
  })

  it("should parse when item does not match", function () {
    const infoDoesNotExistStdout = readFixture("info-does-not-exist.txt")

    assert.deepEqual(
      {
        localInformation: {
          localPath: "D:\\data\\prj\\main.css.map",
        },
      },
      parse(infoDoesNotExistStdout)
    )
  })

  it("should ignore === lines", function () {
    const workfoldStdout = readFixture("workfold.txt")

    assert.deepEqual(
      {
        workspace: "WORKSPACE_1 (Nikolov, Svetoslav)",
        collection: "http://tfs.server:8080/tfs/prj_collection",
        collectionItems: {
          "$/prj/server/index.js": "D:\\data\\server\\index.js",
        },
      },
      parse(workfoldStdout)
    )
  })
})
