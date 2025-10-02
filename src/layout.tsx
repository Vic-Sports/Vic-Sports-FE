import { Outlet } from "react-router-dom";
import Footer from "./components/layout/footer";
import Header from "./components/layout/header";

function Layout() {
  return (
    <div
      style={{
        backgroundColor: "#FFFFFF",
        minHeight: "100vh",
        color: "#1a1a1a"
      }}
    >
      <Header />
      <Outlet />
      <Footer />
    </div>
  );
}

export default Layout;
