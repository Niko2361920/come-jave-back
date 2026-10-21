import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { LoginScreen, SignupScreen } from "@/features/comejave/screens/auth";
import {
  CheckoutScreen,
  OnlinePaymentScreen,
  SuccessScreen,
  WaitingScreen,
} from "@/features/comejave/screens/checkout";
import { HistoryScreen, HomeScreen } from "@/features/comejave/screens/home";
import { CategoryScreen, RestaurantScreen } from "@/features/comejave/screens/menu";
import type { PaymentMethod, ScreenId } from "@/features/comejave/types";
import { useAuth } from "@/hooks/useAuth";
import { useCart } from "@/hooks/useCart";
import { useOrders } from "@/hooks/useOrders";
import { restaurants, type Restaurant } from "@/lib/comejave-data";
import { Screen } from "@/components/comejave/ui";

const DESCRIPTION =
  "Pide en Ventolini y La Frute desde tu celular: elige categoría, agrega al carrito, paga en efectivo o Nequi y revisa tu historial de comidas.";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Come Jave · Pide en el campus Javeriana Cali" },
      { name: "description", content: DESCRIPTION },
      { property: "og:title", content: "Come Jave · Pide en el campus Javeriana Cali" },
      { property: "og:description", content: DESCRIPTION },
    ],
  }),
  component: Index,
});

function Index() {
  const auth = useAuth();
  const cart = useCart();
  const orders = useOrders(auth.user);

  const [screen, setScreen] = useState<ScreenId>("login");
  const [restaurantId, setRestaurantId] = useState<Restaurant["id"]>("ventolini");
  const [categoryId, setCategoryId] = useState("");
  const [method, setMethod] = useState<PaymentMethod>("Efectivo");
  const [reference, setReference] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [orderError, setOrderError] = useState("");
  const [lastOrderId, setLastOrderId] = useState<string | null>(null);
  const [rating, setRating] = useState(0);

  // La sesión decide si se ven las pantallas de acceso o las de la app.
  const loggedIn = Boolean(auth.user);
  useEffect(() => {
    setScreen((current) => {
      if (loggedIn) return current === "login" || current === "signup" ? "home" : current;
      return current === "signup" ? "signup" : "login";
    });
  }, [loggedIn]);

  const browsing = restaurants.find((r) => r.id === restaurantId) ?? restaurants[0]!;
  const category = browsing.categories.find((c) => c.id === categoryId);
  // El carrito es de un solo restaurante: el pedido siempre es del que tiene el carrito.
  const orderRestaurant = restaurants.find((r) => r.id === cart.restaurantId) ?? browsing;

  const goCart = () => cart.count > 0 && setScreen("checkout");

  const resetOrder = () => {
    cart.clear();
    setRating(0);
    setCategoryId("");
    setReference("");
    setOrderError("");
  };

  const confirmOrder = async () => {
    if (submitting) return;
    setSubmitting(true);
    setOrderError("");
    try {
      const id = await orders.placeOrder({
        restaurant: orderRestaurant,
        lines: cart.lines,
        method,
        reference: reference.trim(),
      });
      setLastOrderId(id);
      setRating(0);
      setScreen("success");
    } catch (error) {
      setOrderError(
        error instanceof Error
          ? error.message
          : "No pudimos registrar tu pedido. Inténtalo de nuevo.",
      );
    } finally {
      setSubmitting(false);
    }
  };

  const rate = (value: number) => {
    setRating(value);
    if (lastOrderId) orders.rate(lastOrderId, value);
  };

  const signOut = async () => {
    resetOrder();
    setScreen("login");
    await auth.signOut();
  };

  const renderScreen = () => {
    if (!auth.ready) {
      return (
        <Screen className="flex flex-1 items-center justify-center">
          <p className="text-[15px] text-muted-foreground">Cargando…</p>
        </Screen>
      );
    }

    if (!auth.user) {
      return screen === "signup" ? (
        <SignupScreen
          auth={auth}
          onBack={() => {
            auth.clearMessages();
            setScreen("login");
          }}
          onCreated={() => setScreen("login")}
        />
      ) : (
        <LoginScreen
          auth={auth}
          onSignup={() => {
            auth.clearMessages();
            setScreen("signup");
          }}
        />
      );
    }

    switch (screen) {
      case "history":
        return (
          <HistoryScreen
            orders={orders.history}
            loading={orders.loading}
            loadError={orders.loadError}
            onBack={() => setScreen("home")}
            {...(orders.remote ? { onCancel: orders.cancel } : {})}
          />
        );
      case "restaurant":
        return (
          <RestaurantScreen
            restaurant={browsing}
            cartCount={cart.count}
            onBack={() => setScreen("home")}
            onCart={goCart}
            onPick={(id) => {
              setCategoryId(id);
              setScreen("category");
            }}
          />
        );
      case "category":
        if (!category) return null;
        return (
          <CategoryScreen
            restaurant={browsing}
            category={category}
            cartCount={cart.count}
            cartTotal={cart.total}
            onBack={() => setScreen("restaurant")}
            onCart={goCart}
            onAdd={(item) => cart.add(browsing.id, item)}
          />
        );
      case "checkout":
        return (
          <CheckoutScreen
            lines={cart.lines}
            total={cart.total}
            onBack={() => setScreen(cart.restaurantId ? "restaurant" : "home")}
            onPay={(chosen) => {
              setMethod(chosen);
              setOrderError("");
              setScreen(chosen === "Nequi" ? "online" : "waiting");
            }}
          />
        );
      case "online":
        return (
          <OnlinePaymentScreen
            total={cart.total}
            reference={reference}
            referenceRequired={orders.remote}
            onReference={setReference}
            onBack={() => setScreen("checkout")}
            onNext={() => setScreen("waiting")}
          />
        );
      case "waiting":
        return (
          <WaitingScreen
            restaurantName={orderRestaurant.name}
            submitting={submitting}
            error={orderError}
            onConfirm={() => void confirmOrder()}
            onBack={() => setScreen(method === "Nequi" ? "online" : "checkout")}
          />
        );
      case "success":
        return (
          <SuccessScreen
            restaurantName={orderRestaurant.name}
            remote={orders.remote}
            rating={rating}
            onRate={rate}
            onHome={() => {
              resetOrder();
              setScreen("home");
            }}
            onHistory={() => {
              resetOrder();
              setScreen("history");
            }}
          />
        );
      default:
        return (
          <HomeScreen
            user={auth.user}
            cartCount={cart.count}
            historyCount={orders.history.length}
            onCart={goCart}
            onHistory={() => setScreen("history")}
            onPick={(id) => {
              setRestaurantId(id);
              setScreen("restaurant");
            }}
            onSignOut={() => void signOut()}
          />
        );
    }
  };

  return (
    <main className="flex min-h-screen justify-center bg-surface px-3 py-4 sm:px-4 sm:py-10">
      <div className="flex min-h-screen w-full max-w-[420px] flex-col overflow-y-auto bg-background/95 shadow-[0_18px_60px_rgba(13,45,90,0.12)] ring-1 ring-[#dfe6f3] sm:h-[860px] sm:min-h-0 sm:rounded-[2rem] sm:border sm:border-border">
        {renderScreen()}
      </div>
    </main>
  );
}
