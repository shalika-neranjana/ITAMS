import "./globals.css";

export const metadata = {
  title: "NIPO ITAMS",
  description: "IT Asset Management System",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
