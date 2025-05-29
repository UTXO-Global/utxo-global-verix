/* eslint-disable @typescript-eslint/no-explicit-any */
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import WalletModal from "@/components/wallet-modal";
import useAuthenticate from "@/hooks/useAuthenticate";
import { toast } from "@/hooks/use-toast";
import { useContext, useEffect, useState } from "react";
import { AppContext } from "@/providers/app-provider";
import { LoginButton } from "@telegram-auth/react";
import { BOT_USERNAME } from "@/constants/config";
import { api } from "@/utils/api";
import { useSigner } from "@ckb-ccc/connector-react";
import { isAxiosError } from "axios";
import BirthdayInput from "@/components/ui/birthday.input";
import { Profile } from "@/types/account";

const IcnCopy = ({ onClick }: { onClick: () => void }) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth={1.5}
      stroke="currentColor"
      className="size-5 cursor-pointer active:scale-90"
      onClick={onClick}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M15.75 17.25v3.375c0 .621-.504 1.125-1.125 1.125h-9.75a1.125 1.125 0 0 1-1.125-1.125V7.875c0-.621.504-1.125 1.125-1.125H6.75a9.06 9.06 0 0 1 1.5.124m7.5 10.376h3.375c.621 0 1.125-.504 1.125-1.125V11.25c0-4.46-3.243-8.161-7.5-8.876a9.06 9.06 0 0 0-1.5-.124H9.375c-.621 0-1.125.504-1.125 1.125v3.5m7.5 10.375H9.375a1.125 1.125 0 0 1-1.125-1.125v-9.25m12 6.625v-1.875a3.375 3.375 0 0 0-3.375-3.375h-1.5a1.125 1.125 0 0 1-1.125-1.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H9.75"
      />
    </svg>
  );
};
export default function VeriXForm() {
  const [profile, setProfile] = useState<Profile>({
    telegram_username: "",
    wallet_address: "",
    date_of_birth: "",
  });

  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  const { isLoggedIn } = useAuthenticate();
  const signer = useSigner();
  const { address, telegramInfo, setTelegramInfo } = useContext(AppContext);
  const [isPending, setIsPending] = useState(false);

  useEffect(() => {
    const _profile = { ...profile };
    if (address) {
      _profile.wallet_address = address;
    }

    if (telegramInfo && telegramInfo.username) {
      _profile.telegram_username = telegramInfo.username || "";
    }

    setProfile({ ..._profile });
  }, [address, telegramInfo]);

  useEffect(() => {
    if (!profile.date_of_birth) {
      const date = new Date();
      setProfile((prev) => ({
        ...prev,
        date_of_birth: `${date.getFullYear()}-${
          date.getMonth() + 1
        }-${date.getDate()}`,
      }));
    }
  }, []);

  const signMessage = async (telegram_id: number, dob: string) => {
    try {
      const signed = await signer?.signMessage(
        `My tgid: ${telegram_id} - My DoB: ${dob}`
      );

      if (signed) {
        return {
          signature: JSON.stringify(signed),
          sign_type: signed.signType.toLowerCase(),
        };
      }
      return undefined;
    } catch (error: any) {
      throw error;
    }
  };

  const onSubmit = async () => {
    try {
      setIsPending(true);
      const signature = await signMessage(
        telegramInfo.id,
        profile.date_of_birth
      );

      if (!signature) {
        return toast({
          variant: "destructive",
          title: "Error",
          description: "Signing failed. Please try again later.",
        });
      }

      const payload = {
        tgid: telegramInfo.id,
        ckb_address: profile.wallet_address,
        signature: signature.signature,
        sign_type: signature.sign_type,
        dob: profile.date_of_birth,
      };

      await api.post("/users/verify", payload);
      toast({
        variant: "default",
        title: "Success",
        description: "You have successfully saved your account",
        duration: 3000,
      });
    } catch (error) {
      console.log("*** Submit error: ", error);
      if (isAxiosError(error)) {
        toast({
          variant: "destructive",
          title: "Error",
          description: error.response?.data.message,
        });
        return;
      }
      toast({
        variant: "destructive",
        title: "Error",
        description: (error as any).message,
      });
    } finally {
      setIsPending(false);
    }
  };

  const onCopyAddress = () => {
    navigator.clipboard.writeText(profile.wallet_address).then(() => {
      toast({
        variant: "default",
        title: "Copied",
        description: (
          <div className="break-all text-sm">{profile.wallet_address}</div>
        ),
        duration: 3000,
      });
    });
  };

  const clearErrors = (key?: string) => {
    if (!!key) {
      const _errors = { ...errors };
      delete _errors[key];

      setErrors({ ..._errors });
      return _errors;
    }

    setErrors({});
    return {};
  };

  return (
    <div className="container mx-auto px-4">
      <Card className="max-w-[600px] w-full mx-auto">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-center">
            UTXO Global VeriX
          </CardTitle>
        </CardHeader>
        <CardContent>
          {!telegramInfo.username ? (
            <div>
              <h1 className="text-center text-lg">
                Login telegram to continue
              </h1>
              <div className="mt-4 flex justify-center">
                <LoginButton
                  botUsername={BOT_USERNAME}
                  onAuthCallback={(data) => {
                    setTelegramInfo(data);
                  }}
                  cornerRadius={12}
                />
              </div>
            </div>
          ) : (
            <div>
              {!isLoggedIn ? (
                <div>
                  <h1 className="text-center text-lg">
                    Connect wallet to continue
                  </h1>
                  <div className="flex items-center justify-center py-4">
                    <WalletModal />
                  </div>
                </div>
              ) : (
                <>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <label>Telegram username</label>
                      <Input
                        placeholder="@example"
                        disabled
                        value={profile.telegram_username}
                      />
                      {errors.telegram_username && (
                        <div className="text-red-600 text-sm">
                          {errors.telegram_username}
                        </div>
                      )}
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <label>Wallet address</label>
                        <IcnCopy onClick={onCopyAddress} />
                      </div>
                      <Input
                        value={profile.wallet_address}
                        placeholder="Your wallet address"
                        readOnly
                        className="opacity-50 cursor-not-allowed"
                      />
                      {errors.wallet_address && (
                        <div className="text-red-600 text-sm">
                          {errors.wallet_address}
                        </div>
                      )}
                    </div>
                    <div className="space-y-2 flex flex-col relative">
                      <div className="font-medium mt-2">
                        What is your date of birth ?
                      </div>
                      <BirthdayInput
                        defaultValue={profile.date_of_birth}
                        onChange={(value: string) =>
                          setProfile((prev) => ({
                            ...prev,
                            date_of_birth: value,
                          }))
                        }
                        setError={(error: string) => {
                          clearErrors("date_of_birth");
                          if (!!error) {
                            setErrors((prev) => ({
                              ...prev,
                              date_of_birth: error,
                            }));
                          }
                        }}
                      />

                      {errors.date_of_birth && (
                        <div className="text-red-600 text-sm">
                          {errors.date_of_birth}
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="mt-8">
                    <Button
                      type="submit"
                      className="w-full"
                      disabled={
                        isPending ||
                        !!errors.telegram_username ||
                        !!errors.wallet_address ||
                        !!errors.date_of_birth
                      }
                      onClick={onSubmit}
                    >
                      {isPending && (
                        <svg
                          aria-hidden="true"
                          className="w-6 h-6 text-gray-200 animate-spin dark:text-gray-600 fill-gray-600"
                          viewBox="0 0 100 101"
                          fill="none"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path
                            d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z"
                            fill="currentColor"
                          />
                          <path
                            d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z"
                            fill="currentFill"
                          />
                        </svg>
                      )}
                      Submit
                    </Button>
                  </div>
                  <div className="mt-4">
                    <WalletModal className="w-full" />
                  </div>
                </>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
