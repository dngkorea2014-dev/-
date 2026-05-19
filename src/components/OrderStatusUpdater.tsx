"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

const STATUSES = ["QUOTE", "CONFIRMED", "PRODUCTION", "SHIPPED", "COMPLETED", "CANCELLED"];

export default function OrderStatusUpdater({
  orderId,
  currentStatus,
}: {
  orderId: string;
  currentStatus: string;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function update(status: string) {
    if (status === currentStatus) return;
    setLoading(true);
    await fetch(`/api/orders/${orderId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    setLoading(false);
    router.refresh();
  }

  return (
    <select
      value={currentStatus}
      onChange={(e) => update(e.target.value)}
      disabled={loading}
      className="border border-gray-300 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-50"
    >
      {STATUSES.map((s) => (
        <option key={s} value={s}>{s}</option>
      ))}
    </select>
  );
}
