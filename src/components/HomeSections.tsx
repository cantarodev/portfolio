import { ArchitectureSection } from "@/components/sections/ArchitectureSection";
import { ContactCTA } from "@/components/sections/ContactCTA";
import { LabsSection } from "@/components/sections/LabsSection";
import { Principles } from "@/components/sections/Principles";
import { ProjectsShowcase } from "@/components/sections/ProjectsShowcase";
import { Skills } from "@/components/sections/Skills";

/**
 * Secciones bajo el fold del home. Se hidratan con `client:visible` para no
 * cargar JS hasta que el usuario hace scroll.
 */
export function HomeSections() {
  return (
    <div>
      <ProjectsShowcase />
      <LabsSection />
      <ArchitectureSection />
      <Principles />
      <Skills />
      <ContactCTA />
    </div>
  );
}
