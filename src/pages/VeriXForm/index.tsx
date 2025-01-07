import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import cn from "@/utils/cn";
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import WalletModal from "@/components/wallet-modal";
import useAuthenticate from "@/hooks/useAuthenticate";
import { toast } from "@/hooks/use-toast";
import { useContext, useEffect } from "react";
import { AppContext } from "@/providers/app-provider";

const formSchema = z.object({
  telegram_id: z.string().min(3, {
    message: "Telegram ID must be at least 3 characters.",
  }),
  wallet_address: z.string().min(1, {
    message: "Wallet address is required.",
  }),
  date_of_birth: z.date({
    required_error: "A date of birth is required.",
  }),
});

type FormValues = z.infer<typeof formSchema>;

export default function VeriXForm() {
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      telegram_id: "",
      wallet_address: "",
    },
  });
  const { isLoggedIn } = useAuthenticate();
  const { address } = useContext(AppContext);

  function onSubmit(values: FormValues) {
    toast({
      title: "You submitted the following values:",
      description: (
        <pre className="mt-2 w-[340px] rounded-md bg-slate-950 p-4">
          <code className="text-white">{JSON.stringify(values, null, 2)}</code>
        </pre>
      ),
    });
  }

  useEffect(() => {
    if (address) {
      form.setValue("wallet_address", address);
    } else {
      form.reset();
    }
  }, [address]);

  return (
    <div className="container mx-auto px-4">
      <Card className="max-w-[600px] w-full mx-auto">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-center">UTXO Global VeriX</CardTitle>
        </CardHeader>
        <CardContent>
          {!isLoggedIn ? (
            <div>
              <h1 className="text-center">Connect wallet to continue</h1>
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
                    name="telegram_id"
                    render={({ field }) => (
                      <FormItem>
                        <div>Telegram ID</div>
                        <FormControl>
                          <Input placeholder="@example" {...field} />
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
                        <div>Wallet Address</div>
                        <FormControl>
                          <Input placeholder="Your wallet address" readOnly {...field} />
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
                        <div>Date of birth</div>
                        <Popover>
                          <PopoverTrigger asChild>
                            <FormControl>
                              <Button
                                variant={"outline"}
                                className={cn("w-full pl-3 text-left font-normal", !field.value && "text-muted-foreground")}
                              >
                                {field.value ? format(field.value, "PPP") : <span>Pick a date</span>}
                                <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                              </Button>
                            </FormControl>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0" align="start">
                            <Calendar
                              mode="single"
                              selected={field.value}
                              onSelect={field.onChange}
                              disabled={(date) => date > new Date() || date < new Date("1900-01-01")}
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
                  <Button type="submit" size="lg" className="w-full">
                    Submit
                  </Button>
                </div>
                <div className="mt-8">
                  <WalletModal className="w-full" />
                </div>
              </form>
            </Form>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
