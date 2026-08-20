import { z } from "zod";

/**
 * Always-present form inputs submit empty strings; coerce blank/whitespace to
 * omitted so phone-only updates match the backend "omit both name fields" rule.
 */
function trimToOptional(value: string | undefined): string | undefined {
  if (value === undefined) return undefined;
  const trimmed = value.trim();
  return trimmed === "" ? undefined : trimmed;
}

export const updateProfileSchema = z
  .object({
    firstName: z.string().optional(),
    lastName: z.string().optional(),
    phone: z.string().optional(),
  })
  .strict()
  .transform((data) => ({
    firstName: trimToOptional(data.firstName),
    lastName: trimToOptional(data.lastName),
    phone: trimToOptional(data.phone),
  }))
  .superRefine((data, ctx) => {
    const hasFirst = data.firstName !== undefined;
    const hasLast = data.lastName !== undefined;

    if (hasFirst === hasLast) return;

    const message = "First and last name must be provided together";
    ctx.addIssue({ code: "custom", message, path: ["firstName"] });
    ctx.addIssue({ code: "custom", message, path: ["lastName"] });
  });

export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;
