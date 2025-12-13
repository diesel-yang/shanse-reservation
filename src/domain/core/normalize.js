export function normalizeEnum(value, enumObj, context) {
  if (Object.values(enumObj).includes(value)) {
    return value
  }

  console.warn(`[Domain Unknown] ${context}:`, value)
  return enumObj.UNKNOWN
}
