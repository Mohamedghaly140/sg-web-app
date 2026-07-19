"use client";

import { getAndClearToastCookie } from "@/actions/cookies.actions";
import { usePathname } from "next/navigation";
import { useEffect } from "react";
import { toast } from "sonner";

const RedirectToast = () => {
  const pathname = usePathname();

  useEffect(() => {
    const showCookieToast = async () => {
      const message = await getAndClearToastCookie();

      if (message) {
        toast.success(message);
      }
    };

    showCookieToast();
  }, [pathname]);

  return null;
};

export default RedirectToast;
