export function labelToKey(str: string): string {
  if (!str) {
    return ""
  }
  const key = str
    .split(/\s+/g)
    .map((part) => part[0].toUpperCase() + part.substr(1).toLowerCase())
    .join("")

  return key[0].toLowerCase() + key.substr(1)
}
