"use client";

import {
  type ChangeEvent,
  type FormEvent,
  type MouseEvent,
  useState,
} from "react";
import { z } from "zod";

import FormControl from "@/components/shared/form-control";
import { TextareaControl } from "@/components/shared/textarea-control/textarea-control";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { FieldGroup, FieldLegend, FieldSet } from "@/components/ui/field";
import {
  ToggleGroup,
  ToggleGroupItem,
} from "@/components/ui/toggle-group";
import { composeContactMessage } from "@/features/contact/lib/compose-contact-message";
import {
  contactMessageSchema,
  contactMessageTopics,
  type ContactMessageInput,
} from "@/features/contact/schema/contact-message-schema";
import { atelier } from "@/lib/constants/atelier";

type ContactMessageField = keyof ContactMessageInput;
type ContactMessageErrors = Partial<Record<ContactMessageField, string>>;

function isContactMessageTopic(
  value: string,
): value is ContactMessageInput["topic"] {
  return (contactMessageTopics as readonly string[]).includes(value);
}

export function ContactForm() {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [topic, setTopic] = useState<ContactMessageInput["topic"] | "">("");
  const [message, setMessage] = useState("");
  const [errors, setErrors] = useState<ContactMessageErrors>({});

  const currentInput = { name, phone, email, topic, message };
  const { mailtoHref, whatsappHref } = composeContactMessage(
    currentInput,
    atelier,
  );

  function clearFieldError(field: ContactMessageField) {
    if (!errors[field]) return;

    setErrors((currentErrors) => {
      const nextErrors = { ...currentErrors };
      delete nextErrors[field];
      return nextErrors;
    });
  }

  function handleNameChange(event: ChangeEvent<HTMLInputElement>) {
    setName(event.target.value);
    clearFieldError("name");
  }

  function handlePhoneChange(event: ChangeEvent<HTMLInputElement>) {
    setPhone(event.target.value);
    clearFieldError("phone");
  }

  function handleEmailChange(event: ChangeEvent<HTMLInputElement>) {
    setEmail(event.target.value);
    clearFieldError("email");
  }

  function handleTopicChange(nextTopics: string[]) {
    const nextTopic = nextTopics.at(-1);

    if (nextTopic && isContactMessageTopic(nextTopic)) {
      setTopic(nextTopic);
      clearFieldError("topic");
    }
  }

  function handleMessageChange(event: ChangeEvent<HTMLTextAreaElement>) {
    setMessage(event.target.value);
    clearFieldError("message");
  }

  function handleFormSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
  }

  function handleContactClick(event: MouseEvent<HTMLAnchorElement>) {
    const result = contactMessageSchema.safeParse(currentInput);

    if (result.success) return;

    event.preventDefault();
    const fieldErrors = z.flattenError(result.error).fieldErrors;

    setErrors({
      name: fieldErrors.name?.[0],
      phone: fieldErrors.phone?.[0],
      email: fieldErrors.email?.[0],
      topic: fieldErrors.topic?.[0],
      message: fieldErrors.message?.[0],
    });
  }

  // This client-only fallback provides no delivery confirmation, keeps no
  // record in our systems, and cannot attach a signed-in customer's identity.
  return (
    <div>
      <form
        noValidate
        aria-labelledby="contact-form-heading"
        onSubmit={handleFormSubmit}
      >
        <Card className="gap-3">
          <CardHeader>
            <CardTitle className="text-xl" id="contact-form-heading">
              Write to us
            </CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-3">
            <FieldGroup className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <FormControl
                label="Name"
                name="name"
                type="text"
                autoComplete="name"
                placeholder="Sara Ghaly"
                required
                value={name}
                error={errors.name}
                onChange={handleNameChange}
              />
              <FormControl
                label="Phone (optional)"
                name="phone"
                type="tel"
                autoComplete="tel"
                placeholder="+20 100 000 0001"
                value={phone}
                error={errors.phone}
                onChange={handlePhoneChange}
              />
              <div className="sm:col-span-2">
                <FormControl
                  label="Email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  placeholder="sara@example.com"
                  required
                  value={email}
                  error={errors.email}
                  onChange={handleEmailChange}
                />
              </div>
            </FieldGroup>

            <FieldSet
              className="gap-2"
              data-invalid={Boolean(errors.topic) || undefined}
            >
              <FieldLegend id="contact-topic-label" variant="label">
                What is this about?
              </FieldLegend>
              <ToggleGroup
                className="flex-wrap gap-2 overflow-visible rounded-none border-0"
                variant="tag"
                size="xs"
                spacing={2}
                aria-labelledby="contact-topic-label"
                aria-invalid={Boolean(errors.topic) || undefined}
                aria-describedby={
                  errors.topic ? "contact-topic-error" : undefined
                }
                value={topic ? [topic] : []}
                onValueChange={handleTopicChange}
              >
                {contactMessageTopics.map((contactTopic) => (
                  <ToggleGroupItem
                    key={contactTopic}
                    value={contactTopic}
                    type="button"
                    className="flex-none"
                  >
                    {contactTopic}
                  </ToggleGroupItem>
                ))}
              </ToggleGroup>
              {errors.topic ? (
                <p
                  id="contact-topic-error"
                  className="text-sm text-destructive"
                  role="alert"
                >
                  {errors.topic}
                </p>
              ) : null}
            </FieldSet>

            <TextareaControl
              className="min-h-[150px]"
              label="Message"
              name="message"
              placeholder="Tell us what you need — include the piece name if there is one."
              required
              minLength={10}
              value={message}
              error={errors.message}
              onChange={handleMessageChange}
            />
          </CardContent>
          <CardFooter className="flex-col items-stretch gap-2 border-t-0 pt-0">
            <div className="flex flex-col gap-1 text-2xs text-muted-foreground">
              <p>We use your details only to answer this message.</p>
              <p>This opens your email app with the message pre-filled.</p>
            </div>
            <div className="flex flex-col gap-2 sm:flex-row">
              {mailtoHref ? (
                <Button
                  className="h-auto min-h-11 w-full flex-1"
                  size="lg"
                  nativeButton={false}
                  render={
                    <a href={mailtoHref} onClick={handleContactClick} />
                  }
                >
                  Send message
                </Button>
              ) : null}
              {whatsappHref ? (
                <Button
                  className="h-auto min-h-11 w-full flex-1"
                  variant="outline"
                  size="lg"
                  nativeButton={false}
                  render={
                    <a
                      href={whatsappHref}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={handleContactClick}
                    />
                  }
                >
                  WhatsApp
                </Button>
              ) : null}
            </div>
          </CardFooter>
        </Card>
      </form>

      <div className="mt-6 grid grid-cols-2 gap-4">
        <div>
          <p className="text-eyebrow mb-1">Delivery</p>
          <p className="text-justify text-xs text-muted-foreground">
            Cash on delivery across Egypt, from 65 EGP.
          </p>
        </div>
        <div>
          <p className="text-eyebrow mb-1">Returns</p>
          <p className="text-justify text-xs text-muted-foreground">
            14 days, unworn and with tags. Alterations are final sale.
          </p>
        </div>
      </div>
    </div>
  );
}
