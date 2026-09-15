"use server";

export type SubscribeState = {
  status: "idle" | "success" | "error";
  message?: string;
  email?: string;
};

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function subscribe(
  _state: SubscribeState,
  formData: FormData,
): Promise<SubscribeState> {
  const email = String(formData.get("email") ?? "").trim();

  if (!emailPattern.test(email)) {
    return { status: "error", message: "Enter a valid email address.", email };
  }

  const endpoint = process.env.NEWSLETTER_WEBHOOK_URL;

  if (endpoint) {
    try {
      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      if (!response.ok) throw new Error(`Newsletter webhook responded with ${response.status}`);
    } catch (error) {
      console.error(error);
      return {
        status: "error",
        message: "We could not sign you up just now. Try again in a moment.",
        email,
      };
    }
  }

  return { status: "success", message: "You are on the list. The first letter lands on Friday." };
}
