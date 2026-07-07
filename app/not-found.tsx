import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="container flex min-h-dvh flex-col items-center justify-center py-24 text-center">
      <p className="font-mono text-sm text-ember">$ cd /page</p>
      <h1 className="mt-4 font-display text-6xl font-bold">404</h1>
      <p className="mt-2 font-mono text-muted-foreground">
        bash: page: No such file or directory
      </p>
      <Button asChild className="mt-8">
        <Link href="/">Return home</Link>
      </Button>
    </div>
  );
}
