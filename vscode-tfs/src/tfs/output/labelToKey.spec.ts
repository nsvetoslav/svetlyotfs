import assert from "assert"
import { labelToKey } from "./labelToKey"

describe("parse.labelToKey", function () {
  it("should handle empty string", function () {
    assert.equal("", labelToKey(""))
  })

  it("should handle convert to lower case", function () {
    assert.equal("test", labelToKey("Test"))
  })

  it("should handle convert to camel case", function () {
    assert.equal("testString", labelToKey("Test String"))
  })
})
