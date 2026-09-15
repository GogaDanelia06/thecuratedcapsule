"use client";

import { useActionState, useId } from "react";
import { cx } from "@/lib/cx";
import { subscribe, type SubscribeState } from "./subscribe";
import styles from "./newsletter-form.module.css";

const initialState: SubscribeState = { status: "idle" };

export function NewsletterForm() {
  const [state, formAction, isPending] = useActionState(subscribe, initialState);
  const inputId = useId();
  const statusId = useId();

  return (
    <form action={formAction} noValidate>
      <div className={styles.fields}>
        <label htmlFor={inputId} className="sr-only">
          Email address
        </label>
        <input
          id={inputId}
          name="email"
          type="email"
          autoComplete="email"
          placeholder="you@email.com"
          required
          defaultValue={state.email}
          aria-invalid={state.status === "error" || undefined}
          aria-describedby={statusId}
          className={styles.input}
        />
        <button type="submit" disabled={isPending} className={styles.submit}>
          {isPending ? "Subscribing" : "Subscribe"}
        </button>
      </div>
      <p
        id={statusId}
        role="status"
        className={cx(styles.status, state.status === "error" && styles.error)}
      >
        {state.message}
      </p>
    </form>
  );
}
