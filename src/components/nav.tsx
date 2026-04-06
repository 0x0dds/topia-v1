import Link from "next/link";

export default function Nav() {
  return (
    <nav className="sticky top-0 z-50 border-b border-border bg-bg/80 backdrop-blur-md">
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4">
        <Link href="/" className="font-display text-lg font-bold tracking-tight text-accent">
          topia
        </Link>
        <div className="flex items-center gap-6 text-sm font-medium text-text-muted">
          <Link href="/sets" className="transition-colors hover:text-text">
            Sets
          </Link>
          <Link href="/search" className="transition-colors hover:text-text">
            Search
          </Link>
        </div>
      </div>
    </nav>
  );
}
