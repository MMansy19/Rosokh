import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Rosokh - Islamic Platform",
  description: "Rosokh Islamic Multimedia Platform",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html>
      <body>{children}</body>
    </html>
  );
}
