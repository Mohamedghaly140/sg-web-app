import { ContactForm } from "@/features/contact/components/contact-form";
import { OrderHelpForm } from "@/features/contact/components/order-help-form";

export default function ContactFeature() {
  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-4 py-8 sm:px-6 lg:px-8">
      <h1 className="font-heading text-3xl font-semibold text-foreground sm:text-4xl">
        Contact
      </h1>
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
        <OrderHelpForm />
        <ContactForm />
      </div>
    </div>
  );
}
