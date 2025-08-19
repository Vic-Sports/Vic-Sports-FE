import { Outlet } from "react-router-dom";
import Header from "./components/layout/header";
import Footer from "./components/layout/footer";

function Layout() {
  return (
    <div
      style={{
        backgroundColor: "#000000",
        minHeight: "100vh",
        color: "#ffffff"
      }}
    >
      <Header />
      <Outlet />
      <Footer />
    </div>
  );
}

export default Layout;
