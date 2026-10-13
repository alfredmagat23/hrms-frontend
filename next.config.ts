import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Client-only mock demo: avoid Cache Components prerender restrictions on Date.
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
  async redirects() {
    return [
      { source: "/employee", destination: "/home", permanent: false },
      { source: "/employee/todos", destination: "/todos/tasks", permanent: false },
      {
        source: "/employee/calendar",
        destination: "/calendar",
        permanent: false,
      },
      {
        source: "/employee/attendance",
        destination: "/attendance/my-attendance",
        permanent: false,
      },
      {
        source: "/employee/time-off/request",
        destination: "/leave/request",
        permanent: false,
      },
      {
        source: "/employee/time-off/history",
        destination: "/leave/history",
        permanent: false,
      },
      {
        source: "/employee/time-off/history/:id",
        destination: "/leave/history/:id",
        permanent: false,
      },
      {
        source: "/employee/time-off/balances",
        destination: "/leave/balances",
        permanent: false,
      },
      { source: "/hr", destination: "/home", permanent: false },
      { source: "/hr/todos", destination: "/todos/tasks", permanent: false },
      { source: "/hr/todos/:path*", destination: "/todos/:path*", permanent: false },
      { source: "/hr/calendar", destination: "/calendar", permanent: false },
      { source: "/hr/people", destination: "/people", permanent: false },
      { source: "/hr/people/new", destination: "/people/new", permanent: false },
      {
        source: "/hr/people/:id",
        destination: "/people/:id",
        permanent: false,
      },
      {
        source: "/hr/people/:id/edit",
        destination: "/people/:id/edit",
        permanent: false,
      },
      { source: "/hr/documents", destination: "/documents", permanent: false },
      { source: "/hr/forms", destination: "/forms/library", permanent: false },
      {
        source: "/hr/forms/library",
        destination: "/forms/library",
        permanent: false,
      },
      {
        source: "/hr/workflows",
        destination: "/workflows/dashboard",
        permanent: false,
      },
      {
        source: "/hr/workflows/dashboard",
        destination: "/workflows/dashboard",
        permanent: false,
      },
      {
        source: "/hr/attendance",
        destination: "/attendance/company",
        permanent: false,
      },
      {
        source: "/hr/attendance/my-attendance",
        destination: "/attendance/my-attendance",
        permanent: false,
      },
      {
        source: "/hr/expenses",
        destination: "/expenses/submission",
        permanent: false,
      },
      {
        source: "/hr/expenses/submission",
        destination: "/expenses/submission",
        permanent: false,
      },
      { source: "/hr/okr", destination: "/okr/objectives", permanent: false },
      {
        source: "/hr/okr/objectives",
        destination: "/okr/objectives",
        permanent: false,
      },
      {
        source: "/hr/time-off/requests",
        destination: "/leave/approvals",
        permanent: false,
      },
      {
        source: "/hr/time-off/requests/:id",
        destination: "/leave/approvals/:id",
        permanent: false,
      },
      {
        source: "/hr/time-off/balances",
        destination: "/leave/balances",
        permanent: false,
      },
    ];
  },
};

export default nextConfig;
