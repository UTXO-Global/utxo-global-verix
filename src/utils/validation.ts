import { z } from "zod";

export const formSchema = z.object({
  telegram_username: z.string().min(3, {
    message: "Telegram ID must be at least 3 characters.",
  }),
  wallet_address: z.string().min(1, {
    message: "Wallet address is required.",
  }),
  date_of_birth: z.date({
    required_error: "A date of birth is required.",
  }),
});

export type FormValues = z.infer<typeof formSchema>;
