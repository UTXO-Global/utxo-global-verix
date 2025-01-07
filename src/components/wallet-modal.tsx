import ConnectButton from "@/components/connect-button";
import { Button } from "@/components/ui/button";
import useAuthenticate from "@/hooks/useAuthenticate";
import { useCcc } from "@ckb-ccc/connector-react";

export default function WalletModal({ className }: { className?: string }) {
  const { disconnect } = useCcc();
  const { isLoggedIn } = useAuthenticate();

  return !isLoggedIn ? (
    <ConnectButton />
  ) : (
    <Button
      onClick={() => {
        disconnect();
      }}
      className={className}
      type="button"
    >
      Disconnect
    </Button>
  );
}
