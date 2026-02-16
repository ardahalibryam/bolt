import { Redirect } from "expo-router";
import { useEffect, useState } from "react";
import { getPendingVerification, getToken } from "../lib/auth";

type Destination = "/(tabs)" | "/(auth)/welcome" | "/(auth)/verify-email";

export default function Index() {
  const [isReady, setIsReady] = useState(false);
  const [destination, setDestination] = useState<Destination>("/(auth)/welcome");
  const [pendingEmail, setPendingEmail] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      const token = await getToken();
      if (token) {
        setDestination("/(tabs)");
      } else {
        const email = await getPendingVerification();
        if (email) {
          setPendingEmail(email);
          setDestination("/(auth)/verify-email");
        }
      }
      setIsReady(true);
    })();
  }, []);

  if (!isReady) return null;

  if (destination === "/(auth)/verify-email" && pendingEmail) {
    return <Redirect href={{ pathname: "/(auth)/verify-email", params: { email: pendingEmail } } as any} />;
  }

  return <Redirect href={destination} />;
}
