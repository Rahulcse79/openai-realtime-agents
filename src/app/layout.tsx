import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Realtime API Agents",
  description: "A demo app from OpenAI.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        {/*
          Polyfill for environments that lack crypto.randomUUID.
          Some dependencies bind to it during module evaluation and will crash if it's missing.
        */}
        <script
          dangerouslySetInnerHTML={{
            __html: `(() => {
  try {
    const c = globalThis.crypto;
    if (c && typeof c.randomUUID !== 'function') {
      c.randomUUID = () => {
        const bytes = new Uint8Array(16);
        if (c.getRandomValues) c.getRandomValues(bytes);
        else for (let i = 0; i < 16; i++) bytes[i] = Math.floor(Math.random() * 256);
        bytes[6] = (bytes[6] & 0x0f) | 0x40;
        bytes[8] = (bytes[8] & 0x3f) | 0x80;
        const hex = Array.from(bytes, (b) => b.toString(16).padStart(2, '0')).join('');
        return 
          hex.slice(0, 8) + '-' +
          hex.slice(8, 12) + '-' +
          hex.slice(12, 16) + '-' +
          hex.slice(16, 20) + '-' +
          hex.slice(20);
      };
    }
  } catch {}
})();`,
          }}
        />
      </head>
      <body className={`antialiased`}>{children}</body>
    </html>
  );
}
