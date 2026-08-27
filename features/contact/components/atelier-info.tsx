import { Separator } from "@/components/ui/separator";
import { OrderHelpForm } from "@/features/contact/components/order-help-form";
import { atelier } from "@/lib/constants/atelier";

export function AtelierInfo() {
  const hasAtelierFacts = Boolean(atelier.address || atelier.hours);
  const hasDirectFacts = Boolean(
    atelier.phone || atelier.email || atelier.whatsapp,
  );
  const hasAnyFacts = hasAtelierFacts || hasDirectFacts;

  return (
    <div className="flex flex-col">
      <p className="text-eyebrow">Get in touch</p>
      <h2 className="mt-3 mb-3 font-heading text-[38px] leading-[1.06] font-normal text-foreground">
        Speak to the atelier
      </h2>
      <p className="measure max-w-[46ch] text-sm text-muted-foreground">
        Fittings, alterations, a piece you want in another colour — the people
        who cut and sew are the people who answer. Replies within one working
        day.
      </p>
      {hasAnyFacts ? (
        <>
          <Separator className="my-4" />
          <div className="grid grid-cols-2 gap-4 text-sm">
            {hasAtelierFacts ? (
              <div>
                <p className="text-eyebrow mb-1">The atelier</p>
                {atelier.address ? (
                  <p className="whitespace-pre-line">{atelier.address}</p>
                ) : null}
                {atelier.hours ? (
                  <p className="mt-1 text-xs text-muted-foreground">
                    {atelier.hours}
                  </p>
                ) : null}
              </div>
            ) : null}
            {hasDirectFacts ? (
              <div>
                <p className="text-eyebrow mb-1">Direct</p>
                {atelier.phone ? (
                  <p className="figures">{atelier.phone}</p>
                ) : null}
                {atelier.email ? (
                  <p>
                    <a
                      href={`mailto:${atelier.email}`}
                      className="underline-offset-4 hover:underline"
                    >
                      {atelier.email}
                    </a>
                  </p>
                ) : null}
                {atelier.whatsapp ? (
                  atelier.whatsapp === atelier.phone ? (
                    <p className="mt-1 text-xs text-muted-foreground">
                      WhatsApp on the same number
                    </p>
                  ) : (
                    <p className="mt-1 text-xs text-muted-foreground">
                      WhatsApp:{" "}
                      <a
                        target="_blank"
                        rel="noopener noreferrer"
                        href={`https://wa.me/${atelier.whatsapp.replace(/\D/g, "")}`}
                        className="text-foreground underline-offset-4 hover:underline"
                      >
                        {atelier.whatsapp}
                      </a>
                    </p>
                  )
                ) : null}
              </div>
            ) : null}
          </div>
        </>
      ) : null}
      <Separator className="my-4" />
      <OrderHelpForm />
      <div className="plate mt-6 flex h-[220px] items-center justify-center bg-muted">
        <span className="text-eyebrow">Atelier map or photograph</span>
      </div>
    </div>
  );
}
