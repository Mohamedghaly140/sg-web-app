import Spinner from "@/components/shared/spinner";

export default function Loading() {
  return (
    <div className="flex flex-1 items-center justify-center py-24">
      <Spinner className="size-6" />
    </div>
  );
}
