import { Minus } from "lucide-react";
import { comparisonRows } from "@/lib/pricing-data";
import { SectionHeading } from "@/components/section-heading";
import { Reveal } from "@/components/reveal";
import { cn } from "@/lib/utils";

function Cell({ value }: { value: string }) {
  if (value === "Yes") {
    return <span className="font-medium text-ocean">Yes</span>;
  }
  if (value === "No") {
    return (
      <span className="inline-flex items-center gap-1 text-muted-foreground/50">
        <Minus className="size-3.5" /> No
      </span>
    );
  }
  return <span className="text-muted-foreground">{value}</span>;
}

export function ComparisonTable() {
  return (
    <section
      id="comparison"
      className="scroll-mt-20 border-y border-border bg-muted py-20 sm:py-28"
    >
      <div className="container">
        <SectionHeading
          command="diff --packages"
          title="Package Comparison"
          description="A feature-by-feature look at what each package includes."
        />

        <Reveal i={1}>
          <div className="mt-10 overflow-x-auto rounded-lg border border-border bg-card shadow-card">
            <table className="w-full min-w-[720px] border-collapse text-sm">
              <thead>
                <tr className="border-b border-border bg-white/60 text-left">
                  <th className="p-4 font-display font-semibold text-navy">
                    Feature
                  </th>
                  <th className="p-4 text-center font-display font-semibold text-navy">
                    Web Lite
                  </th>
                  <th className="p-4 text-center font-display font-semibold text-navy">
                    Web Pro
                  </th>
                  <th className="p-4 text-center font-display font-semibold text-navy">
                    Cloud ERP
                  </th>
                </tr>
              </thead>
              <tbody>
                {comparisonRows.map((row, i) => (
                  <tr
                    key={row.feature}
                    className={cn(
                      "border-b border-border last:border-0",
                      i % 2 === 1 && "bg-white/40"
                    )}
                  >
                    <td className="p-4 text-foreground">{row.feature}</td>
                    <td className="p-4 text-center">
                      <Cell value={row.webLite} />
                    </td>
                    <td className="p-4 text-center">
                      <Cell value={row.webPro} />
                    </td>
                    <td className="p-4 text-center">
                      <Cell value={row.cloudERP} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
