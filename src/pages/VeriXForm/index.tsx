/* eslint-disable @typescript-eslint/no-explicit-any */
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import cn from "@/utils/cn";
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import WalletModal from "@/components/wallet-modal";
import useAuthenticate from "@/hooks/useAuthenticate";
import { toast } from "@/hooks/use-toast";
import { useContext, useEffect, useState } from "react";
import { AppContext } from "@/providers/app-provider";
import { LoginButton } from "@telegram-auth/react";
import { BOT_USERNAME } from "@/constants/config";
import { formSchema, FormValues } from "@/utils/validation";
import { api } from "@/utils/api";
import { useSigner } from "@ckb-ccc/connector-react";
import { isAxiosError } from "axios";

export default function VeriXForm() {
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      telegram_username: "",
      wallet_address: "",
    },
  });
  const { isLoggedIn } = useAuthenticate();
  const signer = useSigner();
  const { address, telegramInfo, setTelegramInfo } = useContext(AppContext);
  const [isPending, setIsPending] = useState(false);

  useEffect(() => {
    if (address) {
      form.setValue("wallet_address", address);
    }
    if (telegramInfo && telegramInfo.username) {
      form.setValue("telegram_username", telegramInfo.username);
    }
  }, [address, form, telegramInfo]);

  const signMessage = async (telegram_id: number, dob: string) => {
    try {
      const signature = await signer?.signMessage(
        `My tgid: ${telegram_id} - My DoB: ${dob}`
      );
      return signature?.signature;
    } catch (error: any) {
      console.log(error);
      throw error;
    }
  };

  const onSubmit = async (values: FormValues) => {
    const date_of_birth = new Date(values.date_of_birth);
    const year = date_of_birth.getFullYear();
    const month = String(date_of_birth.getMonth() + 1).padStart(2, "0");
    const day = String(date_of_birth.getDate()).padStart(2, "0");
    const dob = `${year}-${month}-${day}`;

    try {
      setIsPending(true);
      const signature = await signMessage(telegramInfo.id, dob);
      await api.post("/users/verify", {
        tgid: telegramInfo.id,
        ckb_address: values.wallet_address,
        signature: signature?.split("0x")[1],
        dob: dob,
      });
      form.resetField("date_of_birth");
      toast({
        variant: "default",
        title: "Success",
        description: "You have successfully verified your account",
        duration: 3000,
      });
    } catch (error) {
      console.log(error);
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
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)}>
                    <div className="space-y-4">
                      <FormField
                        control={form.control}
                        name="telegram_username"
                        render={({ field }) => (
                          <FormItem>
                            <div>Telegram username</div>
                            <FormControl>
                              <Input
                                placeholder="@example"
                                disabled
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="wallet_address"
                        render={({ field }) => (
                          <FormItem>
                            <div className="flex items-center gap-2">
                              <div>Wallet address</div>
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                fill="none"
                                viewBox="0 0 24 24"
                                strokeWidth={1.5}
                                stroke="currentColor"
                                className="size-5 cursor-pointer active:scale-90"
                                onClick={() => {
                                  navigator.clipboard
                                    .writeText(field.value)
                                    .then(() => {
                                      toast({
                                        variant: "default",
                                        title: "Copied",
                                        description: (
                                          <div className="break-all text-sm">
                                            {field.value}
                                          </div>
                                        ),
                                        duration: 3000,
                                      });
                                    });
                                }}
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  d="M15.75 17.25v3.375c0 .621-.504 1.125-1.125 1.125h-9.75a1.125 1.125 0 0 1-1.125-1.125V7.875c0-.621.504-1.125 1.125-1.125H6.75a9.06 9.06 0 0 1 1.5.124m7.5 10.376h3.375c.621 0 1.125-.504 1.125-1.125V11.25c0-4.46-3.243-8.161-7.5-8.876a9.06 9.06 0 0 0-1.5-.124H9.375c-.621 0-1.125.504-1.125 1.125v3.5m7.5 10.375H9.375a1.125 1.125 0 0 1-1.125-1.125v-9.25m12 6.625v-1.875a3.375 3.375 0 0 0-3.375-3.375h-1.5a1.125 1.125 0 0 1-1.125-1.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H9.75"
                                />
                              </svg>
                            </div>
                            <FormControl>
                              <Input
                                placeholder="Your wallet address"
                                readOnly
                                className="opacity-50 cursor-not-allowed"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="date_of_birth"
                        render={({ field }) => (
                          <FormItem className="flex flex-col">
                            <div>Date of birth 1</div>
                            <Popover>
                              <PopoverTrigger asChild>
                                <FormControl>
                                  <Button
                                    variant={"outline"}
                                    className={cn(
                                      "w-full pl-3 text-left font-normal",
                                      !field.value && "text-muted-foreground"
                                    )}
                                  >
                                    {field.value ? (
                                      format(field.value, "PPP")
                                    ) : (
                                      <span>Pick a date</span>
                                    )}
                                    <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                  </Button>
                                </FormControl>
                              </PopoverTrigger>
                              <PopoverContent
                                className="w-auto p-0"
                                align="start"
                              >
                                <Calendar
                                  mode="single"
                                  selected={field.value}
                                  onSelect={field.onChange}
                                  disabled={(date) =>
                                    date > new Date() ||
                                    date < new Date("1900-01-01")
                                  }
                                  initialFocus
                                  pagedNavigation={true}
                                />
                              </PopoverContent>
                            </Popover>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    <div className="mt-8">
                      <Button
                        type="submit"
                        className="w-full"
                        disabled={isPending}
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
                  </form>
                </Form>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
