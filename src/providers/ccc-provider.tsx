import React from "react";
import { ccc } from "@ckb-ccc/connector-react";

export default function CCCProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const signerSignTypeAllowed = [
    ccc.SignerSignType.BtcEcdsa,
    ccc.SignerSignType.CkbSecp256k1,
    ccc.SignerSignType.DogeEcdsa,
    ccc.SignerSignType.EvmPersonal,
    ccc.SignerSignType.JoyId,
  ];

  return (
    <ccc.Provider
      signerFilter={async (signerInfo) =>
        signerSignTypeAllowed.includes(signerInfo.signer.signType)
      }
    >
      {children}
    </ccc.Provider>
  );
}
