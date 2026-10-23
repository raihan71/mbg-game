import {
  isRouteErrorResponse,
  Link,
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
} from "react-router";
import "./styles/app.css";

export function meta() {
  return [
    { title: "MBG Adventure — one very normal lunch run" },
    {
      name: "description",
      content:
        "One school. One hundred meals. A charmingly complicated lunch delivery adventure.",
    },
    { name: "theme-color", content: "#ebf5ff" },
  ];
}

export function Layout({ children }) {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
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
