import { createFileRoute } from "@tanstack/react-router";
// @ts-expect-error - JSX component without types
import Memora from "@/components/Memora.jsx";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Memora — Retratos sob encomenda" },
      { name: "description", content: "Plataforma Memora para encomendas de retratos artísticos." },
      { property: "og:title", content: "Memora" },
      { property: "og:description", content: "Plataforma Memora para encomendas de retratos artísticos." },
    ],
  }),
  component: Memora,
});
