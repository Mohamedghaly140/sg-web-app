const DEFAULT_LOCALE = "en-EG";
const DEFAULT_TIME_ZONE = "Africa/Cairo";

const egpFormatter = new Intl.NumberFormat(DEFAULT_LOCALE, {
  style: "currency",
  currency: "EGP",
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

const dateFormatter = new Intl.DateTimeFormat(DEFAULT_LOCALE, {
  dateStyle: "medium",
  timeZone: DEFAULT_TIME_ZONE,
});

const dateTimeFormatter = new Intl.DateTimeFormat(DEFAULT_LOCALE, {
  dateStyle: "medium",
  timeStyle: "short",
  timeZone: DEFAULT_TIME_ZONE,
});

const dayMonthFormatter = new Intl.DateTimeFormat(DEFAULT_LOCALE, {
  month: "short",
  day: "numeric",
  timeZone: DEFAULT_TIME_ZONE,
});

const monthYearFormatter = new Intl.DateTimeFormat(DEFAULT_LOCALE, {
  month: "short",
  year: "numeric",
  timeZone: DEFAULT_TIME_ZONE,
});

type CldCrop = "fill" | "fit" | "limit" | "scale" | "thumb";
type CldFormat = "auto" | "jpg" | "jpeg" | "png" | "webp";

type CldTransformOptions = {
  width?: number;
  height?: number;
  crop?: CldCrop;
  gravity?: string;
  quality?: "auto" | number;
  format?: CldFormat;
  dpr?: "auto" | number;
};

type CldTransformation =
  | string
  | readonly string[]
  | CldTransformOptions;

export function formatEGP(amount: string | number): string {
  const value = typeof amount === "number" ? amount : Number(amount);

  if (!Number.isFinite(value)) {
    throw new TypeError(`Invalid EGP amount: ${amount}`);
  }

  return egpFormatter.format(value);
}

export function formatDate(value: string | Date): string {
  return dateFormatter.format(toDate(value));
}

export function formatDateTime(value: string | Date): string {
  return dateTimeFormatter.format(toDate(value));
}

// Chart-axis labels for date-only buckets ("YYYY-MM-DD"). Formatted in a fixed
// time zone so the calendar day is stable across client zones (no hydration drift).
export function formatDayMonth(value: string | Date): string {
  return dayMonthFormatter.format(toDate(value));
}

export function formatMonthYear(value: string | Date): string {
  return monthYearFormatter.format(toDate(value));
}

export function cldUrl(
  imageUrl: string,
  transformation: CldTransformation,
): string {
  const params = serializeCldTransformation(transformation);
  if (!params) {
    return imageUrl;
  }

  const url = new URL(imageUrl);
  const uploadSegment = "/image/upload/";
  const uploadIndex = url.pathname.indexOf(uploadSegment);

  if (url.hostname !== "res.cloudinary.com" || uploadIndex === -1) {
    return imageUrl;
  }

  const insertIndex = uploadIndex + uploadSegment.length;
  url.pathname = `${url.pathname.slice(0, insertIndex)}${params}/${url.pathname.slice(insertIndex)}`;

  return url.toString();
}

function toDate(value: string | Date): Date {
  const date = value instanceof Date ? value : new Date(value);

  if (Number.isNaN(date.getTime())) {
    throw new TypeError(`Invalid date value: ${value}`);
  }

  return date;
}

function serializeCldTransformation(
  transformation: CldTransformation,
): string {
  if (typeof transformation === "string") {
    return sanitizeCldPart(transformation);
  }

  if (isCldParts(transformation)) {
    return transformation.map(sanitizeCldPart).filter(Boolean).join(",");
  }

  const parts = [
    transformation.width ? `w_${transformation.width}` : undefined,
    transformation.height ? `h_${transformation.height}` : undefined,
    transformation.crop ? `c_${transformation.crop}` : undefined,
    transformation.gravity ? `g_${transformation.gravity}` : undefined,
    transformation.quality ? `q_${transformation.quality}` : undefined,
    transformation.format ? `f_${transformation.format}` : undefined,
    transformation.dpr ? `dpr_${transformation.dpr}` : undefined,
  ];

  return parts.filter(Boolean).join(",");
}

function sanitizeCldPart(part: string): string {
  return part.trim().replace(/^\/+|\/+$/g, "");
}

function isCldParts(
  transformation: CldTransformation,
): transformation is readonly string[] {
  return Array.isArray(transformation);
}
