import { useState } from "react";

import TargetForm from "./components/TargetForm";
import TargetList from "./components/TargetList";

function App() {
  const [refreshCount, setRefreshCount] = useState(0);

  const refreshTargets = () => {
    setRefreshCount((count) => count + 1);
  };

  return (
    <div>
      <h1>Network Quality Monitoring System</h1>
      <p>Welcome to our React Dashboard!</p>

      <TargetForm onTargetAdded={refreshTargets} />

      <TargetList refreshCount={refreshCount} />
    </div>
  );
}

export default App;