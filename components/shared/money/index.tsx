import { formatEGP } from "@/lib/format";

type MoneyProps = {
  value: string | number;
};

export function Money({ value }: MoneyProps) {
  return <span className="tabular-nums">{formatEGP(value)}</span>;
}
