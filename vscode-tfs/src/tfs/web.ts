import * as querystring from "querystring"

export function buildVersionControlUrl(collection: string, serverPath: string): string {
  const project = encodeURIComponent(serverPath.split("/")[1])
  const fragment = querystring.stringify({
    path: serverPath,
  })
  return `${collection}/${project}/_versionControl?${fragment}`
}
