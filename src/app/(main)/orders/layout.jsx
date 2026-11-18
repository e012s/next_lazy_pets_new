import { MyOrdersTabProvider } from "@/context/MyOrdersTabContext";

export default function OrdersLayout({ children }) {
  return <MyOrdersTabProvider>{children}</MyOrdersTabProvider>;
}
