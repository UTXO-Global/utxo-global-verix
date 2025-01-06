import React from "react";
import { ccc } from "@ckb-ccc/connector-react";

export default function CCCProvider({ children }: { children: React.ReactNode }) {
  return <ccc.Provider>{children}</ccc.Provider>;
}
