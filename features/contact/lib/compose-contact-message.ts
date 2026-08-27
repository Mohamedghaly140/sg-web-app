import type { ContactMessageInput } from "@/features/contact/schema/contact-message-schema";

export type ContactMessageComposerInput = Omit<
  ContactMessageInput,
  "topic"
> & {
  topic: ContactMessageInput["topic"] | "";
};

type ContactDestination = {
  email?: string;
  whatsapp?: string;
};

type ComposedContactMessage = {
  mailtoHref?: string;
  whatsappHref?: string;
};

function composeMessageBody(input: ContactMessageComposerInput): string {
  const lines = [
    `Topic: ${input.topic}`,
    "",
    `Name: ${input.name}`,
  ];
  const phone = input.phone?.trim();

  if (phone) {
    lines.push(`Phone: ${phone}`);
  }

  lines.push(`Email: ${input.email}`, "", "Message:", input.message);

  return lines.join("\n");
}

export function composeContactMessage(
  input: ContactMessageComposerInput,
  destination: ContactDestination,
): ComposedContactMessage {
  const body = encodeURIComponent(composeMessageBody(input));
  const email = destination.email?.trim();
  const whatsappNumber = destination.whatsapp?.replace(/\D/g, "");

  return {
    mailtoHref: email
      ? `mailto:${email}?subject=${encodeURIComponent(input.topic)}&body=${body}`
      : undefined,
    whatsappHref: whatsappNumber
      ? `https://wa.me/${whatsappNumber}?text=${body}`
      : undefined,
  };
}
