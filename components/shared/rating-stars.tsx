import { LucideStar } from "lucide-react";

import { cn } from "@/lib/utils";

export type RatingStarsProps = {
  /** 0–5. Accepts the API's decimal string as-is. */
  value: string | number;
  /** Edge length of one star in px. */
  size?: number;
  className?: string;
};

/**
 * Five stars filled to a fractional value — the API stores ratings in 0.5
 * increments, so half-filled stars are a real state, not a rounding artefact.
 *
 * Each star layers an accent-filled glyph, clipped to a percentage width, over
 * a faint outline glyph. Purely decorative: the numeric value is always
 * rendered as text beside it, so this is `aria-hidden` and never the only way
 * to read the rating.
 */
export function RatingStars({ value, size = 15, className }: RatingStarsProps) {
  const numeric = typeof value === "number" ? value : Number(value);
  const clamped = Number.isFinite(numeric)
    ? Math.min(5, Math.max(0, numeric))
    : 0;

  return (
    <span
      className={cn("inline-flex shrink-0 items-center gap-0.5", className)}
      aria-hidden
    >
      {[1, 2, 3, 4, 5].map((star) => {
        const fill = Math.min(1, Math.max(0, clamped - (star - 1))) * 100;

        return (
          <span
            key={star}
            className="relative inline-block shrink-0"
            style={{ width: size, height: size }}
          >
            <LucideStar
              className="absolute inset-0 text-muted-foreground/35"
              style={{ width: size, height: size }}
              strokeWidth={1.5}
            />
            {fill > 0 && (
              <span
                className="absolute inset-y-0 left-0 overflow-hidden"
                style={{ width: `${fill}%` }}
              >
                <LucideStar
                  className="fill-accent text-accent"
                  style={{ width: size, height: size }}
                  strokeWidth={1.5}
                />
              </span>
            )}
          </span>
        );
      })}
    </span>
  );
}
