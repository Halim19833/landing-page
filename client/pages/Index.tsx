import { useEffect } from "react";
import HeroSlider from "@/components/home/HeroSlider";
import Boxes from "@/components/home/Boxes";
import LogosMarquee from "@/components/home/LogosMarquee";
import ContactSection from "@/components/home/ContactSection";

export default function Index() {
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  return (
    <div>
      <HeroSlider />
      <Boxes />
      <LogosMarquee />
      <ContactSection />
    </div>
  );
}
