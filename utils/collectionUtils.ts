export function setIntersection<T>(a: Set<T>, b: Set<T>) {
  const intersect = new Set();
  for (const x of Array.from(a)) if (b.has(x)) intersect.add(x);
  return intersect;
}

export function setUnion<T>(a: Set<T>, b: Set<T>) {
  const union = new Set();
  for (const x of Array.from(a)) union.add(x);
  for (const x of Array.from(b)) union.add(x);
  return union;
}
