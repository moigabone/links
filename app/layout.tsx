import type { Metadata, Viewport } from "next";
import { Chakra_Petch, Grenze_Gotisch } from "next/font/google";
import { KnightGarden } from "@/components/KnightGarden";
import "./globals.css";

const display = Grenze_Gotisch({
  subsets: ["latin"],
  weight: ["700", "900"],
  variable: "--font-display",
});
const body = Chakra_Petch({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-body",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://links.gabin-clavier.fr"),
  title: "Gabin Clavier · Liens",
  description: "Carnet de liens de Gabin Clavier : portfolio et Codex.",
  appleWebApp: { capable: true, title: "Liens", statusBarStyle: "black" },
};

export const viewport: Viewport = { themeColor: "#06051a" };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr" className={`${display.variable} ${body.variable}`}>
      <body>
        <div className="site">
          <KnightGarden />
          {children}
        </div>
      </body>
    </html>
  );
}
