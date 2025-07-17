import { useEffect } from "react";
// import { AuthProvider } from "./contexts/AuthContext";
import AppRoutes from "./routes/Approutes";

function App() {
  useEffect(() => {
    document.body.style.backgroundColor = "#f0f0f0"; // สีพื้นหลังอ่อน
    return () => {
      document.body.style.backgroundColor = ""; // reset ถ้ามีการ unmount
    };
  }, []);

  return <AppRoutes />;
}

export default App;
