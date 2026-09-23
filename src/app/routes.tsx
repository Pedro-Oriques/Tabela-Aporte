import { createBrowserRouter } from "react-router";
import Dashboard from "./pages/Dashboard";
import Stocks from "./pages/Stocks";
import Landing from "./pages/Landing";
import { StocksProvider } from "./context/StocksContext";

function RootLayout({ children }: { children: React.ReactNode }) {
  return <StocksProvider>{children}</StocksProvider>;
}

export const router = createBrowserRouter([
  {
    element: <Landing />,
    path: "/",
  },
  {
    element: <RootLayout><Dashboard /></RootLayout>,
    path: "/dashboard",
  },
  {
    element: <RootLayout><Stocks /></RootLayout>,
    path: "/stocks",
  },
]);