import { AtelierInfo } from "@/features/contact/components/atelier-info";
import { ContactForm } from "@/features/contact/components/contact-form";

export default function ContactFeature() {
  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col gap-6 px-4 py-8 sm:px-6 lg:px-8">
      <h1 className="sr-only">Contact</h1>
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
        <AtelierInfo />
        <ContactForm />
      </div>
    </div>
  );
}
