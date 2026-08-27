"use client";

export function ContactForm() {
  // Real "Write to us" form lands in Phase 11.3: name, phone, email,
  // topic, and message fields with a Zod schema, plus mailto and WhatsApp
  // fallbacks. It will have no Server Action or success state.
  return (
    <div className="flex flex-col gap-4">
      <h2 className="text-xl font-semibold text-foreground">Write to us</h2>
      <p className="text-sm text-muted-foreground">Coming soon.</p>
    </div>
  );
}
