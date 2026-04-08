import Link from "next/link";

export default function NotFound() {
  return (
    <div className="mx-auto flex max-w-6xl flex-col items-center justify-center px-4 py-32 text-center">
      <h1 className="font-display text-5xl font-bold tracking-tight">404</h1>
      <p className="mt-2 text-text-muted">That page doesn&apos;t exist.</p>
      <Link
        href="/"
        className="mt-6 rounded-lg bg-accent px-5 py-2 text-sm font-semibold text-white transition-colors hover:bg-accent-hover"
      >
        Go Home
      </Link>
    </div>
  );
}
