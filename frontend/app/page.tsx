"use client";

import { useEffect, useState } from "react";
import { fetchHealth } from "@/lib/api";

export default function Home() {
  const [status, setStatus] = useState("Checking...");

  useEffect(() => {
    fetchHealth()
      .then((data) => setStatus(data.status))
      .catch(() => setStatus("Connection Failed"));
  }, []);

  return (
    <main className="p-10">
      <h1 className="text-2xl font-bold">MentorAI</h1>
      <p className="mt-4">Backend Status: {status}</p>
    </main>
  );
}
