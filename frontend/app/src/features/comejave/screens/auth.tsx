import { useState, type FormEvent } from "react";
import { Btn, Field, Screen } from "@/components/comejave/ui";
import { Brand, Header, PasswordField } from "@/components/comejave/layout";
import type { useAuth } from "@/hooks/useAuth";
import { firebaseEnabled } from "@/lib/firebase";

type Auth = ReturnType<typeof useAuth>;

function Messages({ auth }: { auth: Auth }) {
  return (
    <>
      {auth.error && (
        <p role="alert" className="text-center text-sm font-medium text-red-600">
          {auth.error}
        </p>
      )}
      {auth.notice && (
        <p role="status" className="text-center text-sm font-medium text-primary">
          {auth.notice}
        </p>
      )}
    </>
  );
}

function GoogleButton({
  auth,
  label,
  className,
}: {
  auth: Auth;
  label: string;
  className?: string;
}) {
  if (!firebaseEnabled) return null;
  return (
    <button
      type="button"
      onClick={() => void auth.signInWithGoogle()}
      disabled={auth.loading}
      className={`w-full rounded-full border border-primary/15 bg-white px-5 py-3 text-[15px] font-bold text-primary transition-colors hover:bg-primary-soft disabled:cursor-not-allowed disabled:opacity-70 ${className ?? ""}`}
    >
      {auth.loading ? "Conectando..." : label}
    </button>
  );
}

export function LoginScreen({ auth, onSignup }: { auth: Auth; onSignup: () => void }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    void auth.signInWithEmail(email, password);
  };

  return (
    <Screen className="flex flex-1 flex-col justify-center gap-9 px-7 py-14">
      <Brand />
      <form className="flex flex-col gap-4" onSubmit={submit}>
        <Field
          label={firebaseEnabled ? "Correo institucional" : "Usuario"}
          placeholder={firebaseEnabled ? "nombre@javerianacali.edu.co" : "tu.usuario"}
          autoComplete="username"
          inputMode="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
        />
        <PasswordField
          autoComplete="current-password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
        />
        <Btn full type="submit" className="mt-2" disabled={auth.loading}>
          {auth.loading ? "Ingresando..." : "Ingresar"}
        </Btn>
      </form>
      <GoogleButton auth={auth} label="Continuar con Google" className="mx-auto" />
      <Messages auth={auth} />
      <button
        type="button"
        onClick={onSignup}
        className="mx-auto rounded-full bg-accent-soft px-5 py-2.5 text-[15px] font-bold text-accent-foreground transition-colors hover:bg-accent active:bg-accent"
      >
        Crear cuenta
      </button>
    </Screen>
  );
}

export function SignupScreen({
  auth,
  onBack,
  onCreated,
}: {
  auth: Auth;
  onBack: () => void;
  /** Con Firebase la cuenta queda pendiente de verificar el correo: se vuelve al login. */
  onCreated: () => void;
}) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const created = await auth.signUpWithEmail(name, email, password);
    if (created && firebaseEnabled) onCreated();
  };

  return (
    <Screen className="flex flex-1 flex-col gap-8 px-7 py-10">
      <Header title="Crear cuenta" onBack={onBack} />
      <form className="flex flex-col gap-4" onSubmit={(event) => void submit(event)}>
        <Field
          label="Nombre"
          placeholder="Tu nombre completo"
          autoComplete="name"
          value={name}
          onChange={(event) => setName(event.target.value)}
        />
        <Field
          label="Correo"
          type="email"
          placeholder="nombre@javerianacali.edu.co"
          autoComplete="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
        />
        <PasswordField
          autoComplete="new-password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
        />
        <Btn full type="submit" variant="accent" className="mt-2" disabled={auth.loading}>
          {auth.loading ? "Creando..." : "Crear"}
        </Btn>
      </form>
      <GoogleButton auth={auth} label="Registrarme con Google" />
      <Messages auth={auth} />
    </Screen>
  );
}
