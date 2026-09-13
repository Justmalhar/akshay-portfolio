import Nav from "@/components/Nav";
import Rail from "@/components/Rail";
import Cursor from "@/components/Cursor";
import TableBackground from "@/components/TableBackground";
import Reveal from "@/components/Reveal";
import Hero from "@/components/Hero";
import PoolGame from "@/components/PoolGame";
import Experience from "@/components/Experience";
import Toolkit from "@/components/Toolkit";
import Vezilo from "@/components/Vezilo";
import Prints from "@/components/Prints";
import Lounge from "@/components/Lounge";
import Contact from "@/components/Contact";
import Footer from "@/components/Footer";

export default function Page() {
  return (
    <>
      <Rail />
      <TableBackground />
      <Cursor />
      <Reveal />
      <Nav />
      <main>
        <Hero />
        <PoolGame />
        <Experience />
        <Toolkit />
        <Vezilo />
        <Prints />
        <Lounge />
        <Contact />
      </main>
      <Footer />
    </>
  );
}
