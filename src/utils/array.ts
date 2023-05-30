export function findLast<T>(
  array: T[],
  predicate: (value: T, index: number, obj: T[]) => boolean
): null | T {
  for (let i = array.length - 1; i >= 0; i--) {
    const element = array[i]
    if (predicate(element, i, array)) {
      return element
    }
  }
  return null
}

export function findLastIndex<T>(
  array: T[],
  predicate: (value: T, index: number, obj: T[]) => boolean
) {
  for (let i = array.length - 1; i >= 0; i--) {
    const element = array[i]
    if (predicate(element, i, array)) {
      return i
    }
  }
  return -1
}
