export const metadata = {
  title: "Trade Confirmation Parser — Wafa Gestion",
  description: "Analyse automatique des confirmations MAKOR & TRADITION",
};

export default function RootLayout({ children }) {
  return (
    <html lang="fr">
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@300;400;500;700;800&display=swap"
          rel="stylesheet"
        />
      </head>
      <body style={{ margin: 0, padding: 0, background: "#080c14" }}>
        {children}
      </body>
    </html>
  );
}
