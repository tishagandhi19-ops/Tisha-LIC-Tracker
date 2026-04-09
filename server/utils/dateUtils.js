const MONTH_NAMES = [
  "January","February","March","April","May","June",
  "July","August","September","October","November","December"
];

function parseDateFlexible(s) {

  if (!s || typeof s !== "string") return new Date("");

  const parts = s.split(/[-/]/).map(Number);

  if (parts.length !== 3) return new Date("");

  const [a, b, c] = parts;

  if (String(a).length === 4)
    return new Date(a, b - 1, c || 1);

  if (String(c).length === 4)
    return new Date(c, b - 1, a || 1);

  return new Date("");
}

function* monthsBetweenInclusiveMinusOne(start, end) {

  const cur = new Date(start.getFullYear(), start.getMonth(), 1);

  const endNorm = new Date(end.getFullYear(), end.getMonth(), 1);

  endNorm.setMonth(endNorm.getMonth() - 1);

  while (cur <= endNorm) {

    yield {
      monthName: MONTH_NAMES[cur.getMonth()],
      year: cur.getFullYear()
    };

    cur.setMonth(cur.getMonth() + 1);
  }
}

module.exports = {
  parseDateFlexible,
  monthsBetweenInclusiveMinusOne
};