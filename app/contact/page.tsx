import type { Metadata } from "next";
import ContactFeature from "@/features/contact";

export async function generateMetadata(): Promise<Metadata> {
  return { title: "Contact" };
}

export default function ContactPage() {
  return <ContactFeature />;
}
