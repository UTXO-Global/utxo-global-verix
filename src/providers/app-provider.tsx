"use client";

import React, { createContext, useState, useEffect, useCallback } from "react";
import { ccc, useCcc, useSigner } from "@ckb-ccc/connector-react";
import { DEFAULT_NETWORK } from "@/constants/config";
import { TelegramAuthData } from "@telegram-auth/react";

interface IAppContext {
  address: string | undefined;
  telegramInfo: TelegramAuthData;
  setTelegramInfo: React.Dispatch<React.SetStateAction<TelegramAuthData>>;
}

const defaultValue: IAppContext = {
  address: "",
  telegramInfo: {
    id: 0,
    username: "",
    first_name: "",
    last_name: "",
    photo_url: "",
    auth_date: 18,
    hash: "",
  },
  setTelegramInfo: () => {},
};

const AppContext = createContext<IAppContext>(defaultValue);

const AppProvider = ({ children }: { children: React.ReactNode }) => {
  const [address, setAddress] = useState<string | undefined>(
    defaultValue.address
  );
  const [telegramInfo, setTelegramInfo] = useState<TelegramAuthData>(
    defaultValue.telegramInfo
  );
  const signer = useSigner();
  const { setClient, disconnect } = useCcc();

  const checkIsLoggedIn = useCallback(async () => {
    try {
      const address = await signer?.getRecommendedAddress();
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
    setClient(
      DEFAULT_NETWORK === "mainnet"
        ? new ccc.ClientPublicMainnet()
        : new ccc.ClientPublicTestnet()
    );
  }, [setClient]);

  return (
    <AppContext.Provider value={{ address, telegramInfo, setTelegramInfo }}>
      {children}
    </AppContext.Provider>
  );
};

export { AppContext, AppProvider };
