"use client";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html>
      <body style={{ padding: 24, fontFamily: "sans-serif" }}>
        <h2>App crashed</h2>
        <pre style={{ whiteSpace: "pre-wrap" }}>{error?.message}</pre>
        {error?.stack && <pre style={{ whiteSpace: "pre-wrap" }}>{error.stack}</pre>}
        <button onClick={() => reset()}>Try again</button>
      </body>
    </html>
  );
}