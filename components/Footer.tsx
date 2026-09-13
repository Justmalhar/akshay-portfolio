import { site } from "@/lib/content";

export default function Footer() {
  return (
    <footer>
      <span>© {new Date().getFullYear()} {site.name} · {site.footer}</span>
      <span>Precision · Patience · Position</span>
    </footer>
  );
}
