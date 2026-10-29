import { useState, type FormEvent } from "react";
import { Btn, Field, Notice, Screen } from "@/components/comejave/ui";
import { DishArt } from "@/components/comejave/DishArt";
import { Header, PasswordField } from "@/components/comejave/layout";
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
      <div className="flex items-center gap-3 text-[14px] text-muted-foreground" aria-hidden>
        <span className="h-px flex-1 bg-border" />o<span className="h-px flex-1 bg-border" />
      </div>
      <button
        type="button"
        onClick={() => void auth.signInWithGoogle()}
        disabled={auth.loading}
        className={`pressable min-h-[3.25rem] w-full rounded-2xl bg-card px-5 py-3 text-[17px] font-semibold text-primary ring-1 ring-input transition-colors hover:bg-secondary disabled:cursor-not-allowed disabled:opacity-70 ${className ?? ""}`}
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
    <Screen className="flex flex-1 flex-col bg-primary">
      <div className="relative flex min-h-[300px] flex-1 flex-col justify-end overflow-hidden px-7 pt-12 pb-10 text-white">
        <div aria-hidden className="pointer-events-none absolute -top-6 -right-14 h-56 w-56">
          <DishArt itemId="z2" className="pop h-full w-full rotate-12 drop-shadow-2xl" />
        </div>
        <div aria-hidden className="pointer-events-none absolute top-36 -right-6 h-32 w-32">
          <DishArt
            itemId="b1"
            className="pop h-full w-full -rotate-12 drop-shadow-xl [animation-delay:90ms]"
          />
        </div>
        <div aria-hidden className="pointer-events-none absolute top-6 right-36 h-24 w-24">
          <DishArt
            itemId="p3"
            className="pop h-full w-full rotate-6 drop-shadow-xl [animation-delay:160ms]"
          />
        </div>
        <h1 className="font-display relative text-[64px] leading-[0.9] font-extrabold tracking-[-0.045em]">
          Come
          <br />
          <span className="text-accent">Jave</span>
        </h1>
        <p className="relative mt-4 max-w-[15rem] text-[17px] leading-snug text-white/80">
          Pide en Ventolini y La Frute sin hacer fila.
        </p>
      </div>
      <div className="rounded-t-[28px] bg-background px-7 pt-8 pb-[max(2rem,env(safe-area-inset-bottom))]">
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
        <p className="mt-6 text-center text-[16px] text-muted-foreground">
          ¿Primera vez?{" "}
          <button
            type="button"
            onClick={onSignup}
            className="rounded-md px-1 font-semibold text-primary underline decoration-accent decoration-2 underline-offset-4 hover:decoration-primary"
          >
            Crea tu cuenta
          </button>
        </p>
      </div>
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
    <Screen className="flex flex-1 flex-col gap-8 px-6 pt-6 pb-10">
      <Header title="Crear cuenta" subtitle="Con tu correo de la Javeriana Cali." onBack={onBack} />
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
