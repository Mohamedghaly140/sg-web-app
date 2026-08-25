import { AccountSubNav } from "@/components/shared/account-sub-nav";

export default function AccountLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="mx-auto flex w-full max-w-[1280px] gap-8 px-4 py-8 sm:px-6 lg:px-8">
      <AccountSubNav />
      <div className="min-w-0 flex-1">{children}</div>
    </div>
  );
}
