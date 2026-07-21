import Link from "next/link";
import type { Metadata } from "next";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "Page not found",
  robots: { index: false, follow: true },
};

export default function NotFound() {
  return (
    <div className="container flex min-h-dvh flex-col items-center justify-center py-24 text-center">
      <p className="font-mono text-sm text-ocean">$ cd /page</p>
      <h1 className="mt-4 font-display text-6xl font-bold text-navy">404</h1>
      <p className="mt-2 font-mono text-muted-foreground">
        bash: page: No such file or directory
      </p>
      <p className="mt-4 max-w-sm text-muted-foreground">
        This page doesn&apos;t exist or may have moved. Try one of these
        instead:
      </p>
      <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
        <Button asChild>
          <Link href="/">Return home</Link>
        </Button>
        <Button asChild variant="outline">
          <Link href="/#projects">View projects</Link>
        </Button>
        <Button asChild variant="outline">
          <Link href="/#contact">Contact</Link>
        </Button>
      </div>
    </div>
  );
}
