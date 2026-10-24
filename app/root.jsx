import {
  isRouteErrorResponse,
  Link,
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
} from "react-router";
import "@fontsource/nunito/latin-800.css";
import "@fontsource/nunito/latin-900.css";
import "@fontsource/nunito-sans/latin-500.css";
import "@fontsource/nunito-sans/latin-700.css";
import "./styles/app.css";
import { brandStyles } from "./configs/brand";
import { icons } from "./configs/images";

export function meta() {
  return [
    { title: "MBG Adventure — one very normal lunch run" },
    {
      name: "description",
      content:
        "One school. One hundred meals. A charmingly complicated lunch delivery adventure.",
    },
    { name: "theme-color", content: "#ffffff" },
  ];
}

export function Layout({ children }) {
  return (
    <html lang="en" style={brandStyles}>
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href={icons.brand} />
        <Meta />
        <Links />
      </head>
      <body>
        {children}
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}

export default function App() {
  return <Outlet />;
}

export function ErrorBoundary({ error }) {
  const notFound = isRouteErrorResponse(error) && error.status === 404;
  return (
    <main className="app-shell">
      <section className="results-hero">
        <h1>{notFound ? "Off the route." : "A little detour."}</h1>
        <p>
          {notFound
            ? "This page could not be found."
            : "Something went wrong. Please try again."}
        </p>
        <Link className="button button-dark" to="/">
          Back to base
        </Link>
      </section>
    </main>
  );
}
