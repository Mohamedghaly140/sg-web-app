import { z } from "zod";

// Full six-field whitelist schema (name, phone?, email, topic, message)
// lands in a later task. This is a placeholder so the file/module exists.
export const contactMessageSchema = z.object({});

export type ContactMessageInput = z.infer<typeof contactMessageSchema>;
