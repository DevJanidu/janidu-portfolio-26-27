import Image from "next/image";
import { heroContent, profile } from "@/lib/data";

export function Hero() {
  return (
    <section
      id="top"
      className="flex min-h-[100svh] flex-col px-3 pb-4 pt-20 sm:px-5 sm:pb-6 sm:pt-[84px]"
    >
      <div
        className="relative flex flex-1 flex-col items-center justify-center overflow-hidden rounded-[26px] px-6 py-16 text-center sm:px-12 sm:py-24"
        style={{
          background:
            "linear-gradient(160deg, #071535 0%, #0E2B63 32%, #1C55B5 64%, #56AED8 87%, #B8E4DF 100%)",
        }}
      >
        {/* Transparent logo + brand name lockup (no white box) */}
        <div className="inline-flex items-center gap-3.5">
          <Image
            src="/logo-ribbon.png"
            alt="JaniduDev logo"
            width={78}
            height={56}
            priority
            className="h-12 w-auto object-contain drop-shadow-[0_6px_18px_rgba(3,12,38,0.45)] sm:h-14"
          />
          <span className="text-xl font-semibold tracking-tight text-white sm:text-2xl">
            {profile.publicName}
          </span>
        </div>

        {/* Simple centered headline */}
        <h1 className="mt-7 max-w-4xl text-4xl font-semibold leading-[1.08] tracking-tight text-white sm:text-6xl lg:text-[4rem]">
          {heroContent.headline}
        </h1>

        {/* Short centered description */}
        <p className="mt-6 max-w-2xl text-body text-white/90 sm:text-xl sm:leading-relaxed">
          {heroContent.subheadline}
        </p>

        {/* Two clean centered actions */}
        <div className="mt-10 flex w-full max-w-sm flex-col items-center justify-center gap-3.5 sm:max-w-none sm:flex-row">
          <a
            href="#live-showcase"
            className="inline-flex h-12 w-full items-center justify-center rounded-lg bg-white px-7 text-[15px] font-semibold text-foreground shadow-sm transition-colors hover:bg-white/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-[#1C55B5] sm:w-auto"
          >
            {heroContent.primaryAction.label}
          </a>
          <a
            href={heroContent.secondaryAction.href}
            className="inline-flex h-12 w-full items-center justify-center rounded-lg border border-white/75 bg-white/10 px-7 text-[15px] font-semibold text-white transition-colors hover:bg-white/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-[#1C55B5] sm:w-auto"
          >
            {heroContent.secondaryAction.label}
          </a>
        </div>
      </div>
    </section>
  );
}
