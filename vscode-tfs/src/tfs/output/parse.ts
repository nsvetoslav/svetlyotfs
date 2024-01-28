import { labelToKey } from "./labelToKey"

const tok = (indent: string, value: any) => ({ indent, value })

export function parse(str: string): unknown {
  const noItemsMatchRe = /^No items match\s+(.+)/
  const lineRe = /(\s*)(?:([=]{3,})|(?:([^:]+):(.*)))(?:\r\n)/g
  const stack = []
  let current: Record<string, any> = {}
  let prevKey: string | undefined
  let matches

  if (!str) {
    return null
  }

  if ((matches = noItemsMatchRe.exec(str)) !== null) {
    return {
      localInformation: {
        localPath: matches[1].trim(),
      },
    }
  }

  stack.push(tok("", current))

  while ((matches = lineRe.exec(str)) !== null) {
    const [, indent, isComment, _key, _value] = matches
    if (isComment) {
      continue
    }
    const key = labelToKey(_key.trim())
    const value = _value.substr(1)

    if (prevKey && indent.length > stack[stack.length - 1].indent.length) {
      if (current[prevKey]) {
        prevKey += "Items"
      }
      current[prevKey] = {}
      current = current[prevKey]
      stack.push(tok(indent, current))
    } else if (indent.length < stack[stack.length - 1].indent.length) {
      while (indent.length !== stack[stack.length - 1].indent.length) {
        stack.pop()
      }
      current = stack[stack.length - 1].value
    }
    current[key] = value
    prevKey = key
  }

  return stack[0].value
}
