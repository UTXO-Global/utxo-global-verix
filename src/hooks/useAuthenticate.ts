import { AppContext } from "@/providers/app-provider";
import { useContext, useMemo } from "react";

const useAuthenticate = () => {
  const { address } = useContext(AppContext);
  const isLoggedIn = useMemo(() => {
    return Boolean(address);
  }, [address]);

  return { isLoggedIn };
};

export default useAuthenticate;
