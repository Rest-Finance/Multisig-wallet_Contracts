import "./App.css";
import { Faucet, Header, WalletsTable } from "./views";
import { ToastContainer } from "react-toastify";

function App() {
  return (
    <div className="relative min-h-screen bg-zinc-800 text-slate-200 font-mono">
      <Header />
      <Faucet />
      <div className="m-auto pt-5 pb-10 max-w-5xl">
        <WalletsTable />
        <ToastContainer />
      </div>
      <div className="absolute bottom-0 inset-x-0">
        <p className="text-center pt-5">
          Made by{" "}
          <a href="https://github.com/PABlond" className="text-indigo-600" target="_blank">
            Pierre-Alexis Blond
          </a>{" "}
          for Rest-Finance
        </p>
      </div>
    </div>
  );
}

export default App;
