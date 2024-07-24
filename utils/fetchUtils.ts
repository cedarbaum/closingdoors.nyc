export async function fetchJsonAndThrow<T>(url: string) {
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(res.statusText);
  }
  return res.json() as T;
}
