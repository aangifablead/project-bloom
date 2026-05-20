import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";

export const AcceptInvitePage = () => {
  const { token } = useParams();
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");

  useEffect(() => {
    if (!token) return;
   const confirmInvite = async () => {
      try {
        setStatus("loading");
        await axios.post(`http://localhost:5000/api/team/accept-invite/${token}`);
        setStatus("success");
      } catch (err) {
        console.error("Invite processing failed:", err);
        setStatus("error");
      }
    };
    confirmInvite();
  }, [token]);
  
  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-950 text-white">
      <div className="p-8 bg-gray-900 border border-gray-800 rounded-xl shadow-2xl max-w-md w-full text-center">
        
        {status === "loading" && (
          <div className="space-y-4">
            <div className="animate-spin h-10 w-10 border-4 border-blue-500 border-t-transparent rounded-full mx-auto" />
            <h2 className="text-xl font-semibold">Verifying Invitation...</h2>
          </div>
        )}

        {status === "success" && (
          <div className="space-y-4">
            <div className="text-5xl">🎉</div>
            <h2 className="text-2xl font-bold text-green-400">Welcome Aboard!</h2>
            <p className="text-gray-400">Your invitation has been accepted successfully. You can now access the dashboard.</p>
            <a href="/dashboard" className="block mt-6 px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg transition font-medium">
              Go to Dashboard
            </a>
          </div>
        )}

        {status === "error" && (
          <div className="space-y-4">
            <div className="text-5xl">⚠️</div>
            <h2 className="text-2xl font-bold text-red-400">Invalid Invite</h2>
            <p className="text-gray-400">This invitation link is invalid or has already been used.</p>
          </div>
        )}
        
      </div>
    </div>
  );
};