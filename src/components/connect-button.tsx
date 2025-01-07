import { Button } from "@/components/ui/button";
import { useCcc } from "@ckb-ccc/connector-react";

export default function ConnectButton() {
  const { open } = useCcc();
  return (
    <Button onClick={open} size="lg">
      Connect Wallet
    </Button>
  );
}
