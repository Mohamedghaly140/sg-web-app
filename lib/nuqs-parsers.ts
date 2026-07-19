import { createParser } from "nuqs/server";
import { format, isValid, parse, parseISO } from "date-fns";

const DATE_ONLY_FORMAT = "yyyy-MM-dd";
const ISO_UTC_DATETIME_PATTERN =
  /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d{1,3})?Z$/;

function isValidDateOnly(value: string): boolean {
  const date = parse(value, DATE_ONLY_FORMAT, new Date());
  return isValid(date) && format(date, DATE_ONLY_FORMAT) === value;
}

function isValidIsoUtcDateTime(value: string): boolean {
  return ISO_UTC_DATETIME_PATTERN.test(value) && isValid(parseISO(value));
}

/**
 * `YYYY-MM-DD` string param, validated by a strict format roundtrip so
 * malformed values (e.g. from a hand-edited or stale URL) fall back to the
 * parser's default instead of reaching the API as an unvalidated string —
 * the API rejects a malformed `from`/`to` with a 422 that read-path
 * components don't otherwise recover from gracefully.
 *
 * Only for endpoints whose doc narrows dates to date-only, e.g. Analytics
 * (`docs/integration/admin/02-analytics.md`). For endpoints under the
 * general "Dates are ISO 8601 UTC strings" convention
 * (`docs/integration/admin/00-conventions.md`), use `parseAsApiDate`.
 */
export const parseAsDateOnly = createParser<string>({
  parse(value) {
    return isValidDateOnly(value) ? value : null;
  },
  serialize(value) {
    return value;
  },
});

/**
 * `YYYY-MM-DD` or full ISO 8601 UTC datetime (`2026-07-09T12:00:00.000Z`),
 * per the general "Dates" convention (`docs/integration/admin/00-conventions.md`).
 * Accepts both because in-app date pickers only ever produce the shorter
 * date-only form, but the documented API contract for `createdAt`-range
 * filters (e.g. orders' `from`/`to`) allows the full timestamp too — a
 * date-only-only parser would silently drop a valid hand-built or shared URL.
 * Malformed values fall back to the parser's default, same as `parseAsDateOnly`.
 */
export const parseAsApiDate = createParser<string>({
  parse(value) {
    return isValidDateOnly(value) || isValidIsoUtcDateTime(value)
      ? value
      : null;
  },
  serialize(value) {
    return value;
  },
});
