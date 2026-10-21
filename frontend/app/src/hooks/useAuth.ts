import { useCallback, useEffect, useState } from "react";
import {
  buildInstitutionalGoogleProvider,
  friendlyAuthError,
  getDisplayName,
  isJaverianaEmail,
} from "@/lib/auth.utils";
import { firebaseEnabled, getFirebaseAuth } from "@/lib/firebase";
import type { SessionUser } from "@/features/comejave/types";

const USER_KEY = "comejave.user";

function readStoredUser(): SessionUser | null {
  try {
    const raw = localStorage.getItem(USER_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<SessionUser>;
    return { name: getDisplayName(parsed.name), email: parsed.email ?? "" };
  } catch {
    return null;
  }
}

function storeUser(user: SessionUser | null) {
  try {
    if (user) localStorage.setItem(USER_KEY, JSON.stringify(user));
    else localStorage.removeItem(USER_KEY);
  } catch {
    /* sin almacenamiento disponible: se ignora */
  }
}

/**
 * Sesión del usuario.
 * - Con Firebase configurado: sesión real (correo+contraseña o Google); solo
 *   entran correos @javerianacali.edu.co con el correo verificado.
 * - Sin Firebase: modo demo local (sin servidor), como antes.
 */
export function useAuth() {
  const [user, setUser] = useState<SessionUser | null>(null);
  // Con Firebase hay que esperar a que responda antes de decidir si hay sesión.
  const [ready, setReady] = useState(!firebaseEnabled);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!firebaseEnabled) {
      setUser(readStoredUser());
      return;
    }

    let mounted = true;
    let unsubscribe: (() => void) | undefined;

    (async () => {
      const auth = await getFirebaseAuth();
      if (!auth || !mounted) return;
      const { onAuthStateChanged, signOut } = await import("firebase/auth");
      unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
        if (!firebaseUser) {
          setUser(null);
          setReady(true);
          return;
        }
        const email = (firebaseUser.email ?? "").toLowerCase();
        if (!isJaverianaEmail(email) || !firebaseUser.emailVerified) {
          // Sesión que el backend rechazaría igual: se cierra para no quedar a medias.
          void signOut(auth);
          return;
        }
        setUser({
          name: getDisplayName(firebaseUser.displayName || email.split("@")[0]),
          email,
        });
        setReady(true);
      });
    })();

    return () => {
      mounted = false;
      unsubscribe?.();
    };
  }, []);

  const run = useCallback(async (task: () => Promise<void>, fallback: string) => {
    setLoading(true);
    setError("");
    setNotice("");
    try {
      await task();
      return true;
    } catch (cause) {
      setError(friendlyAuthError(cause, fallback));
      console.error(cause);
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  const signInWithGoogle = useCallback(
    () =>
      run(async () => {
        const auth = await getFirebaseAuth();
        if (!auth) throw new Error("Firebase no está configurado");
        const { signInWithPopup, signOut } = await import("firebase/auth");
        const result = await signInWithPopup(auth, await buildInstitutionalGoogleProvider());
        if (!isJaverianaEmail(result.user.email ?? "")) {
          await signOut(auth);
          throw Object.assign(new Error("dominio no permitido"), { code: "domain" });
        }
      }, "No pudimos iniciar sesión con Google. Inténtalo nuevamente."),
    [run],
  );

  const signInWithEmail = useCallback(
    async (email: string, password: string) => {
      const normalized = email.trim().toLowerCase();

      if (!firebaseEnabled) {
        // Modo demo sin servidor: sirve para enseñar el flujo de pantallas.
        const name = getDisplayName(normalized.split("@")[0]);
        const demoUser = {
          name,
          email: normalized ? `${normalized.split("@")[0]}@javerianacali.edu.co` : "",
        };
        storeUser(demoUser);
        setUser(demoUser);
        return true;
      }

      if (!isJaverianaEmail(normalized)) {
        setError("El correo debe terminar en @javerianacali.edu.co");
        return false;
      }
      return run(async () => {
        const auth = await getFirebaseAuth();
        if (!auth) throw new Error("Firebase no está configurado");
        const { signInWithEmailAndPassword, signOut } = await import("firebase/auth");
        const credential = await signInWithEmailAndPassword(auth, normalized, password);
        if (!credential.user.emailVerified) {
          await signOut(auth);
          throw Object.assign(new Error("correo sin verificar"), { code: "unverified" });
        }
      }, "No pudimos iniciar sesión. Inténtalo nuevamente.");
    },
    [run],
  );

  const signUpWithEmail = useCallback(
    async (name: string, email: string, password: string) => {
      const normalized = email.trim().toLowerCase();
      if (!isJaverianaEmail(normalized)) {
        setError("El correo debe terminar en @javerianacali.edu.co");
        return false;
      }
      const displayName = getDisplayName(name.trim() || normalized.split("@")[0]);

      if (!firebaseEnabled) {
        const demoUser = { name: displayName, email: normalized };
        storeUser(demoUser);
        setUser(demoUser);
        setError("");
        return true;
      }

      const created = await run(async () => {
        const auth = await getFirebaseAuth();
        if (!auth) throw new Error("Firebase no está configurado");
        const { createUserWithEmailAndPassword, sendEmailVerification, signOut, updateProfile } =
          await import("firebase/auth");
        const credential = await createUserWithEmailAndPassword(auth, normalized, password);
        await updateProfile(credential.user, { displayName });
        await sendEmailVerification(credential.user);
        await signOut(auth);
      }, "No pudimos crear la cuenta. Inténtalo nuevamente.");
      if (created) {
        setNotice(
          "Te enviamos un correo para verificar tu cuenta. Confírmalo y luego inicia sesión.",
        );
      }
      return created;
    },
    [run],
  );

  const signOutUser = useCallback(async () => {
    storeUser(null);
    setUser(null);
    if (!firebaseEnabled) return;
    const auth = await getFirebaseAuth();
    if (!auth) return;
    const { signOut } = await import("firebase/auth");
    await signOut(auth);
  }, []);

  const clearMessages = useCallback(() => {
    setError("");
    setNotice("");
  }, []);

  return {
    user,
    ready,
    error,
    notice,
    loading,
    signInWithGoogle,
    signInWithEmail,
    signUpWithEmail,
    signOut: signOutUser,
    clearMessages,
  };
}
