import { createActor } from "@/backend";
import { useActor } from "@caffeineai/core-infrastructure";

export function useBackend() {
  const { actor, isFetching } = useActor(createActor);
  return { actor, isFetching };
}

export function useFormatCurrency() {
  return (amount: number): string => {
    return `₹${amount.toLocaleString("en-IN", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  };
}
