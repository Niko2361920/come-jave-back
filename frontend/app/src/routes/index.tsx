import { createFileRoute } from "@tanstack/react-router";
import { useCallback, useEffect, useState } from "react";
import { LoginScreen, SignupScreen } from "@/features/comejave/screens/auth";
import {
  CheckoutScreen,
  OnlinePaymentScreen,
  SuccessScreen,
  WaitingScreen,
} from "@/features/comejave/screens/checkout";
import { HistoryScreen, HomeScreen } from "@/features/comejave/screens/home";
import { RestaurantScreen } from "@/features/comejave/screens/menu";
import type { PaymentMethod } from "@/features/comejave/types";
import { useAuth } from "@/hooks/useAuth";
import { useCart } from "@/hooks/useCart";
import { useOrders } from "@/hooks/useOrders";
import { useScreenHistory } from "@/hooks/useScreenHistory";
import { restaurants, type Product, type Restaurant } from "@/lib/comejave-data";
import { ConfirmDialog, Screen, Toast } from "@/components/comejave/ui";

const DESCRIPTION =
  "Pide en Ventolini y La Frute desde tu celular: elige categoría, agrega al carrito, paga en efectivo o Nequi y revisa tu historial de comidas.";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Come Jave: pide en el campus Javeriana Cali" },
      { name: "description", content: DESCRIPTION },
      { property: "og:title", content: "Come Jave: pide en el campus Javeriana Cali" },
      { property: "og:description", content: DESCRIPTION },
    ],
  }),
  component: Index,
});

type PendingAdd = { restaurant: Restaurant; item: Product };

function Index() {
  const auth = useAuth();
  const cart = useCart();
  const orders = useOrders(auth.user);
  const { screen, go, replace, back } = useScreenHistory("login");

  const [restaurantId, setRestaurantId] = useState<Restaurant["id"]>("ventolini");
  const [categoryId, setCategoryId] = useState("");
  const [method, setMethod] = useState<PaymentMethod>("Efectivo");
  const [reference, setReference] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [orderError, setOrderError] = useState("");
  const [lastOrderId, setLastOrderId] = useState<string | null>(null);
  // El carrito se vacía al enviar: se guarda el restaurante para la pantalla de éxito.
  const [lastRestaurant, setLastRestaurant] = useState<Restaurant | null>(null);
  const [rating, setRating] = useState(0);
  const [toast, setToast] = useState("");
  const [pendingAdd, setPendingAdd] = useState<PendingAdd | null>(null);
  const clearToast = useCallback(() => setToast(""), []);

  // La sesión decide si se ven las pantallas de acceso o las de la app.
  const loggedIn = Boolean(auth.user);
  useEffect(() => {
    if (loggedIn && (screen === "login" || screen === "signup")) replace("home");
    if (!loggedIn && screen !== "login" && screen !== "signup") replace("login");
    // Solo reacciona a cambios de sesión.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loggedIn]);

  const browsing = restaurants.find((r) => r.id === restaurantId) ?? restaurants[0]!;
  const category = browsing.categories.find((c) => c.id === categoryId) ?? browsing.categories[0]!;
  // El carrito es de un solo restaurante: el pedido siempre es del que tiene el carrito.
  const cartRestaurant = restaurants.find((r) => r.id === cart.restaurantId);
  const orderRestaurant = cartRestaurant ?? browsing;

  const goCart = () => go("checkout");

  const addToCart = (restaurant: Restaurant, item: Product) => {
    if (cart.conflictsWith(restaurant.id)) {
      setPendingAdd({ restaurant, item });
      return;
    }
    cart.add(restaurant.id, item);
    setToast(`${item.name} agregado`);
  };

  const resetOrder = () => {
    cart.clear();
    setRating(0);
    setCategoryId("");
    setReference("");
    setOrderError("");
    setMethod("Efectivo");
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
      setLastRestaurant(orderRestaurant);
      setRating(0);
      cart.clear();
      setReference("");
      // El pedido ya se envió: no se debe poder volver a esta pantalla con "atrás".
      replace("success");
    } catch (error) {
      setOrderError(
        error instanceof Error ? error.message : "No se pudo enviar el pedido. Intenta de nuevo.",
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
    replace("login");
    await auth.signOut();
  };

  const renderScreen = () => {
    if (!auth.ready) {
      return (
        <Screen className="flex flex-1 items-center justify-center">
          <p role="status" className="text-[15px] text-muted-foreground">
            Cargando…
          </p>
        </Screen>
      );
    }

    if (!auth.user) {
      return screen === "signup" ? (
        <SignupScreen
          auth={auth}
          onBack={() => {
            auth.clearMessages();
            back("login");
          }}
          onCreated={() => replace("login")}
        />
      ) : (
        <LoginScreen
          auth={auth}
          onSignup={() => {
            auth.clearMessages();
            go("signup");
          }}
        />
      );
    }

    // Si el carrito quedó vacío (por ejemplo, al volver atrás), el pago no tiene sentido.
    const paying = screen === "online" || screen === "waiting";
    const current = paying && cart.count === 0 ? "checkout" : screen;

    switch (current) {
      case "history":
        return (
          <HistoryScreen
            orders={orders.history}
            loading={orders.loading}
            loadError={orders.loadError}
            onBack={() => back("home")}
            onBrowse={() => replace("home")}
            {...(orders.remote ? { onCancel: orders.cancel } : {})}
          />
        );
      case "restaurant":
      case "category":
        return (
          <RestaurantScreen
            restaurant={browsing}
            category={category}
            cartCount={cart.count}
            cartTotal={cart.total}
            qtyOf={cart.qtyOf}
            onBack={() => back("home")}
            onCart={goCart}
            onCategory={setCategoryId}
            onAdd={(item) => addToCart(browsing, item)}
            onDecrement={cart.decrement}
          />
        );
      case "checkout":
        return (
          <CheckoutScreen
            restaurant={orderRestaurant}
            lines={cart.lines}
            total={cart.total}
            method={method}
            onMethod={(chosen) => {
              setMethod(chosen);
              setOrderError("");
            }}
            onIncrement={(line) => cart.add(orderRestaurant.id, line)}
            onDecrement={cart.decrement}
            onBack={() => back("home")}
            onBrowse={() => replace("home")}
            onContinue={() => go(method === "Nequi" ? "online" : "waiting")}
          />
        );
      case "online":
        return (
          <OnlinePaymentScreen
            total={cart.total}
            reference={reference}
            referenceRequired={orders.remote}
            onReference={setReference}
            onBack={() => back("checkout")}
            onNext={() => go("waiting")}
          />
        );
      case "waiting":
        return (
          <WaitingScreen
            restaurant={orderRestaurant}
            lines={cart.lines}
            total={cart.total}
            method={method}
            reference={reference.trim()}
            submitting={submitting}
            error={orderError}
            onConfirm={() => void confirmOrder()}
            onBack={() => back("checkout")}
          />
        );
      case "success":
        return (
          <SuccessScreen
            restaurant={lastRestaurant ?? orderRestaurant}
            remote={orders.remote}
            rating={rating}
            onRate={rate}
            onHome={() => {
              resetOrder();
              replace("home");
            }}
            onHistory={() => {
              resetOrder();
              replace("history");
            }}
          />
        );
      default:
        return (
          <HomeScreen
            user={auth.user}
            cartCount={cart.count}
            cartTotal={cart.total}
            {...(cartRestaurant ? { cartRestaurant } : {})}
            historyCount={orders.history.length}
            onCart={goCart}
            onHistory={() => go("history")}
            onPick={(id) => {
              setRestaurantId(id);
              setCategoryId("");
              go("restaurant");
            }}
            onSignOut={() => void signOut()}
          />
        );
    }
  };

  return (
    <main className="flex min-h-dvh justify-center bg-surface sm:items-center sm:px-4 sm:py-8">
      <div className="relative flex min-h-dvh w-full max-w-[420px] flex-col overflow-y-auto overscroll-contain bg-background sm:h-[min(880px,calc(100dvh-4rem))] sm:min-h-0 sm:rounded-[44px] sm:shadow-[0_40px_80px_-30px_rgba(14,30,54,0.45),0_0_0_10px_#0e1e36]">
        {renderScreen()}
        <Toast message={toast} onDone={clearToast} />
      </div>
      <ConfirmDialog
        open={pendingAdd !== null}
        title="¿Empezar un pedido nuevo?"
        body={
          pendingAdd && cartRestaurant
            ? `Tu carrito tiene platos de ${cartRestaurant.name}. Cada pedido es de un solo restaurante: si agregas ${pendingAdd.item.name}, se vacía el carrito actual.`
            : ""
        }
        confirmLabel="Vaciar y agregar"
        cancelLabel="Mantener mi carrito"
        onConfirm={() => {
          if (pendingAdd) {
            cart.clear();
            cart.add(pendingAdd.restaurant.id, pendingAdd.item);
            setToast(`${pendingAdd.item.name} agregado`);
          }
          setPendingAdd(null);
        }}
        onCancel={() => setPendingAdd(null)}
      />
    </main>
  );
}
