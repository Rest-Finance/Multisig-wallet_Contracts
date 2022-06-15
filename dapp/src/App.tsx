import "./App.css";
import { Faucet, Header, WalletsTable } from "./views";
import { ToastContainer } from "react-toastify";

function App() {
  return (
    <div className="bg-slate-800 text-slate-200 font-mono">
      <Header />
      <Faucet />
      <WalletsTable />
      <ToastContainer />
    </div>
  );
}

export default App;
