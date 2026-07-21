/**
 * Renders a JSON-LD <script> tag. Escapes "<" so embedded strings can never
 * prematurely close the script tag or inject markup — safe even though the
 * data here is always static/trusted.
 */
export function JsonLd({ data }: { data: Record<string, unknown> }) {
  const json = JSON.stringify(data).replace(/</g, "\\u003c");
  return (
    <script
      type="application/ld+json"
      // eslint-disable-next-line react/no-danger
      dangerouslySetInnerHTML={{ __html: json }}
    />
  );
}
