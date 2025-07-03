
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

const Index = () => {
  const navigate = useNavigate();
  
  useEffect(() => {
    // Redirect to client site instead of non-existent /sports route
    navigate('/client');
  }, [navigate]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
      <div className="text-white text-center">
        <div className="text-4xl font-bold mb-4">
          <span className="text-white">BET</span>
          <span className="text-orange-500">HUB</span>
        </div>
        <p className="text-gray-400">Loading...</p>
      </div>
    </div>
  );
};

export default Index;
