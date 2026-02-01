"use client";

/**
 * useCSRFToken Hook
 *
 * Client-side hook to fetch CSRF token for form submissions.
 * Use this when submitting forms via JavaScript (fetch/axios).
 *
 * Usage:
 * ```tsx
 * function ContactForm() {
 *   const { token, loading, error } = useCSRFToken();
 *
 *   const handleSubmit = async (formData: FormData) => {
 *     formData.append("csrfToken", token);
 *     await fetch("/api/contact", {
 *       method: "POST",
 *       body: JSON.stringify(Object.fromEntries(formData)),
 *     });
 *   };
 *
 *   if (loading) return <Spinner />;
 *   return <form onSubmit={handleSubmit}>...</form>;
 * }
 * ```
 *
 * @see ADR-0002 for CSRF protection architecture
 */

import { useState, useEffect } from "react";

interface CSRFTokenState {
  token: string;
  loading: boolean;
  error: Error | null;
}

export function useCSRFToken(): CSRFTokenState {
  const [state, setState] = useState<CSRFTokenState>({
    token: "",
    loading: true,
    error: null,
  });

  useEffect(() => {
    async function fetchToken() {
      try {
        const response = await fetch("/api/csrf-token", {
          method: "GET",
          credentials: "same-origin",
        });

        if (!response.ok) {
          throw new Error(`Failed to fetch CSRF token: ${response.status}`);
        }

        const data = await response.json();
        setState({
          token: data.token,
          loading: false,
          error: null,
        });
      } catch (error) {
        setState({
          token: "",
          loading: false,
          error: error instanceof Error ? error : new Error("Unknown error"),
        });
      }
    }

    fetchToken();
  }, []);

  return state;
}
