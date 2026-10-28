import { useState, type FormEvent } from "react";
import { Btn, Field, Notice, Screen } from "@/components/comejave/ui";
import { Brand, Header, PasswordField } from "@/components/comejave/layout";
import type { useAuth } from "@/hooks/useAuth";
import { firebaseEnabled } from "@/lib/firebase";

type Auth = ReturnType<typeof useAuth>;

function Messages({ auth }: { auth: Auth }) {
  return (
    <>
      {auth.error && <Notice>{auth.error}</Notice>}
      {auth.notice && <Notice tone="info">{auth.notice}</Notice>}
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
    <>
      <div className="flex items-center gap-3 text-[13px] text-muted-foreground" aria-hidden>
        <span className="h-px flex-1 bg-border" />o<span className="h-px flex-1 bg-border" />
      </div>
      <button
        type="button"
        onClick={() => void auth.signInWithGoogle()}
        disabled={auth.loading}
        className={`min-h-12 w-full rounded-xl border border-primary/20 bg-white px-5 py-3 text-[15px] font-semibold text-primary transition-colors hover:bg-primary-soft disabled:cursor-not-allowed disabled:opacity-70 ${className ?? ""}`}
      >
        {auth.loading ? "Conectando…" : label}
      </button>
    </>
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
          autoCapitalize="none"
          spellCheck={false}
          required
          value={email}
          onChange={(event) => setEmail(event.target.value)}
        />
        <PasswordField
          required
          autoComplete="current-password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
        />
        <Btn full type="submit" className="mt-2" disabled={auth.loading}>
          {auth.loading ? "Ingresando…" : "Ingresar"}
        </Btn>
        <Messages auth={auth} />
        <GoogleButton auth={auth} label="Continuar con Google" />
      </form>
      <p className="text-center text-[15px] text-muted-foreground">
        ¿Primera vez?{" "}
        <button
          type="button"
          onClick={onSignup}
          className="rounded-md px-1 font-bold text-primary underline decoration-accent decoration-2 underline-offset-4 hover:decoration-primary"
        >
          Crea tu cuenta
        </button>
      </p>
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
          autoCapitalize="none"
          spellCheck={false}
          required
          {...(firebaseEnabled ? { hint: "Solo correos @javerianacali.edu.co" } : {})}
          value={email}
          onChange={(event) => setEmail(event.target.value)}
        />
        <PasswordField
          required
          minLength={6}
          hint="Mínimo 6 caracteres."
          autoComplete="new-password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
        />
        <Btn full type="submit" variant="accent" className="mt-2" disabled={auth.loading}>
          {auth.loading ? "Creando cuenta…" : "Crear cuenta"}
        </Btn>
        <Messages auth={auth} />
        <GoogleButton auth={auth} label="Registrarme con Google" />
      </form>
    </Screen>
  );
}
