import * as assert from "assert"
import { buildVersionControlUrl } from "./web"

describe("tf.web.buildVersionControlUrl", function () {
  it("should build url", function () {
    const collection = "http://server/tfs"
    const serverPath = "$/path/to/main.js"

    assert.equal(
      buildVersionControlUrl(collection, serverPath),
      "http://server/tfs/path/_versionControl?path=%24%2Fpath%2Fto%2Fmain.js"
    )
  })
})
