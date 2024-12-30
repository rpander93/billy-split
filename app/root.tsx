import { Links, Meta, Outlet, Scripts, ScrollRestoration } from "@remix-run/react";
import type { LinksFunction } from "@remix-run/node";

import { css } from "~/styled-system/css";
import { Modal } from "~/components/modal";

import styles from "./root.css?url";

export const links: LinksFunction = () => [
  { rel: "preconnect", href: "https://fonts.googleapis.com" },
  {
    rel: "preconnect",
    href: "https://fonts.gstatic.com",
    crossOrigin: "anonymous",
  },
  {
    rel: "stylesheet",
    href: "https://fonts.googleapis.com/css2?family=Lato&family=Nanum+Pen+Script&family=PT+Serif&family=Inconsolata&display=swap",
  },
  {
    rel: "stylesheet",
    href: styles,
  }
];

export function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <Meta />
        <Links />
      </head>
      <body className={css({ display: "flex", flexDirection: "column", maxWidth: "576px", marginX: "auto", padding: 4 })}>
        {children}
        <Modal.Root />
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}

export default function App() {
  return <Outlet />;
}
