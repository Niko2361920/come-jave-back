export const INSTITUTIONAL_DOMAIN = "javerianacali.edu.co";

export function isJaverianaEmail(value: string): boolean {
  const normalized = value.trim().toLowerCase();

  if (!normalized || !normalized.includes("@")) {
    return false;
  }

  return normalized.endsWith(`@${INSTITUTIONAL_DOMAIN}`);
}

export function getDisplayName(value?: string | null): string {
  const safeName = (value ?? "").trim();

  return safeName || "Javeriano";
}

// firebase/auth se importa de forma dinámica para que no entre al bundle inicial.
export async function buildInstitutionalGoogleProvider() {
  const { GoogleAuthProvider } = await import("firebase/auth");
  const provider = new GoogleAuthProvider();
  provider.setCustomParameters({
    hd: INSTITUTIONAL_DOMAIN,
    prompt: "select_account",
  });

  return provider;
}

const FIREBASE_ERRORS: Record<string, string> = {
  domain: "Solo se permiten correos con dominio @javerianacali.edu.co",
  unverified: "Verifica tu correo (te enviamos un enlace) antes de iniciar sesión.",
  "auth/invalid-credential": "Correo o contraseña incorrectos.",
  "auth/user-not-found": "Correo o contraseña incorrectos.",
  "auth/wrong-password": "Correo o contraseña incorrectos.",
  "auth/email-already-in-use": "Ese correo ya tiene una cuenta. Inicia sesión.",
  "auth/weak-password": "La contraseña debe tener al menos 6 caracteres.",
  "auth/invalid-email": "El correo no es válido.",
  "auth/too-many-requests": "Demasiados intentos. Espera un momento e inténtalo de nuevo.",
  "auth/popup-closed-by-user": "Cerraste la ventana de Google antes de terminar.",
  "auth/network-request-failed": "No pudimos conectar. Revisa tu internet.",
};

export function friendlyAuthError(error: unknown, fallback: string): string {
  const code = (error as { code?: string } | null)?.code;
  return (code && FIREBASE_ERRORS[code]) || fallback;
}
