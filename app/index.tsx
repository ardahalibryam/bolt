import { Redirect } from "expo-router";
import { useEffect, useState } from "react";
import { getToken } from "../lib/auth";

export default function Index() {
  const [isReady, setIsReady] = useState(false);
  const [hasToken, setHasToken] = useState(false);

  useEffect(() => {
    getToken().then((token) => {
      setHasToken(!!token);
      setIsReady(true);
    });
  }, []);

  if (!isReady) return null;

  return <Redirect href={hasToken ? "/(tabs)" : "/(auth)/welcome"} />;
}
