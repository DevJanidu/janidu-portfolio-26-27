"use client";

import { useState, type FormEvent } from "react";
import { Mail, Send, CheckCircle2, Clock } from "lucide-react";
import { profile } from "@/lib/data";
import { SectionHeading } from "@/components/section-heading";
import { Reveal } from "@/components/reveal";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

const inputClass =
  "w-full rounded-md border border-input bg-white px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground/70 transition-colors focus:border-ocean focus:outline-none focus:ring-2 focus:ring-ring";

export function Contact() {
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const formData = new FormData(e.currentTarget);
    const payload = {
      name: formData.get("name"),
      email: formData.get("email"),
      message: formData.get("message"),
      company: formData.get("company"), // honeypot — real visitors leave this blank
    };

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to send message.");
      setSent(true);
    } catch (err) {
      console.error("Failed to send message", err);
      setError(
        err instanceof Error ? err.message : "Something went wrong. Please email me directly!"
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <section id="contact" className="scroll-mt-20 py-20 sm:py-28">
      <div className="container">
        <SectionHeading
          command="mail --to janidu"
          title="Interested in working together?"
          description={profile.availability + "."}
        />

        <div className="mt-12 grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
          <Reveal>
            <Card className="h-full">
              <CardContent className="flex h-full flex-col justify-between gap-8 p-6 sm:p-8">
                <div>
                  <p className="text-muted-foreground">
                    Whether it&apos;s a freelance build, a full-time role, or a
                    quick technical question — the fastest way to reach me is
                    email.
                  </p>
                  <a
                    href={`mailto:${profile.email}`}
                    className="mt-6 inline-flex items-center gap-2 font-mono text-lg text-ocean hover:underline"
                  >
                    <Mail className="size-5" />
                    {profile.email}
                  </a>
                </div>
                <p className="inline-flex items-center gap-2 text-sm text-muted-foreground">
                  <Clock className="size-4 text-ocean" />
                  {profile.responseTime}
                </p>
              </CardContent>
            </Card>
          </Reveal>

          <Reveal i={1}>
            <Card>
              <CardContent className="p-6 sm:p-8">
                {sent ? (
                  <div
                    role="status"
                    className="flex flex-col items-center justify-center py-12 text-center"
                  >
                    <CheckCircle2 className="size-10 text-emerald-500" />
                    <h3 className="mt-4 font-display text-xl font-semibold text-navy">
                      Message sent successfully!
                    </h3>
                    <p className="mt-2 max-w-sm text-sm text-muted-foreground">
                      Thanks for reaching out. I&apos;ll get back to you as soon as possible.
                    </p>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-4" noValidate>
                    <input
                      type="text"
                      name="company"
                      tabIndex={-1}
                      autoComplete="off"
                      className="hidden"
                      aria-hidden="true"
                    />
                    <div className="grid gap-4 sm:grid-cols-2">
                      <div>
                        <label
                          htmlFor="name"
                          className="mb-1.5 block text-sm font-medium"
                        >
                          Name
                        </label>
                        <input
                          id="name"
                          name="name"
                          type="text"
                          required
                          autoComplete="name"
                          placeholder="Ada Lovelace"
                          className={inputClass}
                        />
                      </div>
                      <div>
                        <label
                          htmlFor="email"
                          className="mb-1.5 block text-sm font-medium"
                        >
                          Email
                        </label>
                        <input
                          id="email"
                          name="email"
                          type="email"
                          required
                          autoComplete="email"
                          placeholder="ada@example.com"
                          className={inputClass}
                        />
                      </div>
                    </div>
                    <div>
                      <label
                        htmlFor="message"
                        className="mb-1.5 block text-sm font-medium"
                      >
                        Message
                      </label>
                      <textarea
                        id="message"
                        name="message"
                        required
                        rows={5}
                        placeholder="Tell me about your project or role…"
                        className={inputClass + " resize-y"}
                      />
                    </div>
                    {error && (
                      <p role="alert" className="text-sm text-red-600">
                        {error}
                      </p>
                    )}
                    <Button type="submit" size="lg" className="w-full sm:w-auto" disabled={loading}>
                      {loading ? "Sending..." : "Send message"} <Send className="size-4" />
                    </Button>
                  </form>
                )}
              </CardContent>
            </Card>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
