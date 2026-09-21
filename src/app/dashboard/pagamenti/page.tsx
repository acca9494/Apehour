import { redirect } from "next/navigation";

// Sezione nascosta finché non c'è un sistema di pagamento reale.
export default function PaymentsPage() {
  redirect("/dashboard");
}
