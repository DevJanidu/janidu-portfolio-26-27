import {
  ArrowUpRight,
  Briefcase,
  GraduationCap,
  Linkedin,
  MapPin,
  Users,
} from "lucide-react";
import { profile, current, education, linkedin as linkedinInfo } from "@/lib/data";
import { SectionHeading } from "@/components/section-heading";
import { Reveal } from "@/components/reveal";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const nameParts = profile.name.split(" ");
const initials = `${nameParts[0][0]}${nameParts[nameParts.length - 1][0]}`;

export function LinkedInHighlight() {
  return (
    <section id="linkedin" className="scroll-mt-20 py-20 sm:py-28">
      <div className="container">
        <SectionHeading
          command="curl linkedin.com/in/janidu-yapa"
          title="Let's connect on LinkedIn"
        />

        <Reveal className="mt-12">
          <Card className="mx-auto max-w-2xl overflow-hidden">
            {/* Brand-gradient banner — an original composition, not a clone
                of LinkedIn's own cover-photo chrome. */}
            <div className="h-20 bg-gradient-to-r from-navy via-ocean to-cyan sm:h-24" />
            <CardContent className="-mt-10 p-6 sm:p-8">
              <div className="flex size-20 items-center justify-center rounded-full border-4 border-white bg-gradient-to-br from-ocean to-navy font-display text-2xl font-bold text-white shadow-card">
                {initials}
              </div>

              <div className="mt-4">
                <h3 className="font-display text-xl font-bold text-navy">
                  {profile.name}
                </h3>
                <p className="text-sm text-muted-foreground">{profile.title}</p>
              </div>

              <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
                {linkedinInfo.headline}
              </p>

              <div className="mt-5 flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-muted-foreground">
                <span className="inline-flex items-center gap-1.5">
                  <MapPin className="size-4 text-ocean" />
                  {profile.location}
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <Briefcase className="size-4 text-ocean" />
                  {current.company}
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <GraduationCap className="size-4 text-ocean" />
                  {education[0].school}
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <Users className="size-4 text-ocean" />
                  {linkedinInfo.connections} connections
                </span>
              </div>

              <div className="mt-6">
                <Button asChild variant="outline">
                  <a
                    href={profile.socials.linkedin}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <Linkedin className="size-4" /> View full LinkedIn profile{" "}
                    <ArrowUpRight className="size-4" />
                  </a>
                </Button>
              </div>
            </CardContent>
          </Card>
        </Reveal>
      </div>
    </section>
  );
}
