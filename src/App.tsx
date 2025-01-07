import { Toaster } from "@/components/ui/toaster";
import VeriXForm from "@/pages/VeriXForm";

const App = () => {
  return (
    <div className="bg-slate-200 min-h-screen flex items-center justify-center">
      <VeriXForm />
      <Toaster />
    </div>
  );
};

export default App;
