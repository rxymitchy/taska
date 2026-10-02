"use client";

import { useEffect } from "react";
import { btnPrimary } from "@/lib/styles";

export default function ErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="mx-auto max-w-lg px-5 py-16 lg:px-0">
      <section className="content-surface">
        <h1 className="text-3xl tracking-tight">Something went wrong</h1>
        <p className="mt-3 text-muted">
          Refresh the page. If this is a new setup, check that the database is
          running and seeded.
        </p>
        <button
          className={`${btnPrimary} mt-6`}
          onClick={() => reset()}
          type="button"
        >
          Try again
        </button>
      </section>
    </div>
  );
}
