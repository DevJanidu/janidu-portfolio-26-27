import Link from "next/link";
import type { Metadata } from "next";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "Page not found",
  robots: { index: false, follow: true },
};

export default function NotFound() {
  return (
    <div className="container flex min-h-[75dvh] flex-col items-center justify-center py-24 text-center">
      <p className="section-label">404 error</p>
      <h1 className="mt-3 text-4xl font-semibold tracking-tight text-foreground sm:text-5xl">
        Page not found
      </h1>
      <p className="mt-4 max-w-md text-body text-muted-foreground">
        This page may have moved or the link may be out of date. You can view
        recent projects or start an inquiry below.
      </p>
      <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
        <Button asChild size="lg">
          <Link href="/">Back to home</Link>
        </Button>
        <Button asChild size="lg" variant="outline">
          <Link href="/#work">View projects</Link>
        </Button>
        <Button asChild size="lg" variant="outline">
          <Link href="/salon-concepts">Salon concepts</Link>
        </Button>
        <Button asChild size="lg" variant="ghost">
          <Link href="/#contact">Start a project</Link>
        </Button>
      </div>
    </div>
  );
}
