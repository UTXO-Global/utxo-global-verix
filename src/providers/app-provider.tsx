"use client";

import React, { createContext, useState, useEffect, useCallback } from "react";
import { ccc, useCcc, useSigner } from "@ckb-ccc/connector-react";
import { DEFAULT_NETWORK } from "@/constants/config";

interface IAppContext {
  address: string | undefined;
}

const defaultValue = {
  address: "",
};

const AppContext = createContext<IAppContext>(defaultValue);

const AppProvider = ({ children }: { children: React.ReactNode }) => {
  const [address, setAddress] = useState<string | undefined>(defaultValue.address);
  const signer = useSigner();
  const { setClient, disconnect } = useCcc();

  const checkIsLoggedIn = useCallback(async () => {
    try {
      const address = await signer?.getInternalAddress();
      setAddress(address);
    } catch (error) {
      disconnect();
      console.log(error);
    }
  }, [signer]);

  useEffect(() => {
    checkIsLoggedIn();
  }, [checkIsLoggedIn]);

  useEffect(() => {
    setClient(DEFAULT_NETWORK === "mainnet" ? new ccc.ClientPublicMainnet() : new ccc.ClientPublicTestnet());
  }, [setClient]);

  return <AppContext.Provider value={{ address }}>{children}</AppContext.Provider>;
};

export { AppContext, AppProvider };
