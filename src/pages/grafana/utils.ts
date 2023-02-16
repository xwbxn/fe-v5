export function JSONParse(str) {
  if (str) {
    try {
      return JSON.parse(str);
    } catch (e) {
      console.error(e);
    }
  }
  return {};
}
