import { captureRemixErrorBoundaryError } from "@sentry/remix";
import { Links, Meta, Outlet, Scripts, ScrollRestoration, useRouteError } from "@remix-run/react";
import type { LinksFunction, MetaFunction } from "@remix-run/node";

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
    href: "https://fonts.googleapis.com/css2?family=Inconsolata:wght@200..900&family=Lato:wght@400;700;900&family=Nanum+Pen+Script&family=PT+Serif:wght@400;700&display=swap",
  },
  {
    rel: "stylesheet",
    href: styles,
  }
];

export const meta: MetaFunction = () => [
  {
    property: "description",
    content: "Split bills and track who paid back what",
  },
  { property: "og:title", content: "Billy - Split with friends" },
  {
    property: "og:description",
    content: "Split bills and track who paid back what",
  },
  { property: "og:url", content: "https://billy-split.it" },
  { property: "og:image", content: "https://billy-split.it/favicon.ico" },
  { title: "Billy - Scan bills and split with friends" },
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

export const ErrorBoundary = () => {
  const error = useRouteError();
  captureRemixErrorBoundaryError(error);
  return <div>Something went wrong</div>;
};

export default function App() {
  return <Outlet />;
}