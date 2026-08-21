import { z } from "zod";

export const claimTokenSchema = z.string().length(64);
