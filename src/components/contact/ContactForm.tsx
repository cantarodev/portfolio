import { useState } from "react";
import {
  AlertTriangle,
  CheckCircle2,
  Loader2,
  Mail,
  MessageSquare,
  Send,
  User,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { PERSONAL } from "@/lib/constants";

type Status = "idle" | "loading" | "success" | "error";

/** Endpoint externo (Lambda/Function URL) para el formulario. */
const ENDPOINT = import.meta.env.PUBLIC_CONTACT_ENDPOINT;

const labelClass =
  "flex items-center gap-1.5 font-mono text-[11px] tracking-wide text-crema/60 uppercase";

export function ContactForm({ compact = false }: { compact?: boolean }) {
  const [status, setStatus] = useState<Status>("idle");
  const [feedback, setFeedback] = useState("");

  async function handleSubmit(event: React.SyntheticEvent<HTMLFormElement>) {
    event.preventDefault();
    if (status === "loading") return;

    const form = event.currentTarget;
    const data = new FormData(form);

    setStatus("loading");
    setFeedback("");

    const name = String(data.get("name") ?? "");
    const email = String(data.get("email") ?? "");
    const message = String(data.get("message") ?? "");

    // Sitio estático: si no hay endpoint configurado, abrimos el cliente de correo.
    if (!ENDPOINT) {
      const subject = encodeURIComponent(`[Portafolio] ${name}`);
      const body = encodeURIComponent(`${message}\n\n— ${name} (${email})`);
      window.location.href = `mailto:${PERSONAL.email}?subject=${subject}&body=${body}`;
      setStatus("success");
      setFeedback("ABRIENDO TU CLIENTE DE CORREO…");
      form.reset();
      return;
    }

    try {
      const response = await fetch(ENDPOINT, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          email,
          message,
          company: data.get("company"),
        }),
      });

      const payload = (await response.json().catch(() => null)) as
        | { status?: number; log?: string }
        | null;

      const statusCode = payload?.status ?? response.status;
      if (!response.ok || statusCode >= 400) {
        throw new Error(payload?.log ?? "No se pudo enviar el mensaje.");
      }

      setStatus("success");
      setFeedback(payload?.log ?? "MENSAJE ENVIADO");
      form.reset();
    } catch (error) {
      setStatus("error");
      setFeedback(
        error instanceof Error ? error.message : "Error inesperado. Intenta de nuevo.",
      );
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5">
      <p className="flex items-center gap-2 font-mono text-[11px] text-crema/60">
        <span className="relative flex size-1.5" aria-hidden>
          <span className="absolute inline-flex size-full animate-ping rounded-full bg-term/70" />
          <span className="relative inline-flex size-1.5 rounded-full bg-term" />
        </span>
        Respuesta directa a tu correo
      </p>

      <div className={compact ? "grid gap-4" : "grid gap-4 sm:grid-cols-2"}>
        <div className="flex flex-col gap-2">
          <label htmlFor="contact-name" className={labelClass}>
            <User className="size-3.5" aria-hidden /> Nombre
          </label>
          <Input
            id="contact-name"
            name="name"
            required
            autoComplete="name"
            placeholder="Tu nombre"
          />
        </div>
        <div className="flex flex-col gap-2">
          <label htmlFor="contact-email" className={labelClass}>
            <Mail className="size-3.5" aria-hidden /> Email
          </label>
          <Input
            id="contact-email"
            name="email"
            type="email"
            required
            autoComplete="email"
            placeholder="tu@empresa.com"
          />
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <label htmlFor="contact-message" className={labelClass}>
          <MessageSquare className="size-3.5" aria-hidden /> Mensaje
        </label>
        <Textarea
          id="contact-message"
          name="message"
          required
          minLength={10}
          placeholder="Rol, proyecto o idea..."
        />
      </div>

      {/* Honeypot: los humanos nunca ven ni rellenan esto. */}
      <input
        type="text"
        name="company"
        tabIndex={-1}
        autoComplete="off"
        aria-hidden
        className="pointer-events-none absolute h-0 w-0 opacity-0"
      />

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <Button
          type="submit"
          disabled={status === "loading"}
          className="h-11 w-full sm:w-auto sm:min-w-44"
        >
          {status === "loading" ? (
            <>
              <Loader2 className="animate-spin" /> Enviando...
            </>
          ) : (
            <>
              <Send /> Enviar mensaje
            </>
          )}
        </Button>

        <span aria-live="polite" className="min-h-4 sm:text-right">
          {status === "success" && (
            <span className="flex items-center gap-1.5 break-all text-xs text-term sm:justify-end">
              <CheckCircle2 className="size-4 shrink-0" /> {feedback}
            </span>
          )}
          {status === "error" && (
            <span className="flex items-center gap-1.5 break-all text-xs text-term-red sm:justify-end">
              <AlertTriangle className="size-4 shrink-0" /> {feedback}
            </span>
          )}
        </span>
      </div>
    </form>
  );
}
