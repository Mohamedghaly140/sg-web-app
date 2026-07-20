import RedirectToast from "@/components/shared/redirect-toast";
import React from "react";

type RootTemplateProps = {
  children: React.ReactNode;
};

export default function RootTemplate({
  children,
}: Readonly<RootTemplateProps>) {
  return (
    <>
      {children}
      <RedirectToast />
    </>
  );
}
