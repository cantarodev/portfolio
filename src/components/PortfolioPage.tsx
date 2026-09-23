import { SiteBackdrop } from "@/components/2d/SiteBackdrop";
import { MobileSocialDock } from "@/components/MobileSocialDock";
import { SocialSidebar } from "@/components/SocialSidebar";
import { ArchitectureSection } from "@/components/sections/ArchitectureSection";
import { ContactCTA } from "@/components/sections/ContactCTA";
import { Footer } from "@/components/sections/Footer";
import { Hero } from "@/components/sections/Hero";
import { LabsSection } from "@/components/sections/LabsSection";
import { Principles } from "@/components/sections/Principles";
import { ProjectsShowcase } from "@/components/sections/ProjectsShowcase";
import { Skills } from "@/components/sections/Skills";

/**
 * Portafolio en español. Secciones esenciales, sin redundancia:
 * Hero → Proyectos → Labs → Arquitectura → Principios → Skills → Contacto.
 */
export function PortfolioPage() {
  return (
    <>
      <SiteBackdrop />
      <SocialSidebar />
      <MobileSocialDock />

      <div className="relative z-10">
        <main id="main" className="pb-16 lg:pb-0">
          <Hero />
          <ProjectsShowcase />
          <LabsSection />
          <ArchitectureSection />
          <Principles />
          <Skills />
          <ContactCTA />
        </main>
        <Footer />
      </div>
    </>
  );
}
