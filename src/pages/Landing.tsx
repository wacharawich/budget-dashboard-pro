import { useEffect } from "react";
import { useNavigate } from "react-router";
import { Loader2 } from "lucide-react";

export default function Landing() {
  const navigate = useNavigate();

  useEffect(() => {
    navigate("/", { replace: true });
  }, [navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-sky-50 via-cyan-50 to-teal-50">
      <div className="flex items-center gap-3">
        <Loader2 className="size-6 animate-spin text-blue-500" />
        <span className="text-sm text-gray-500">กำลังโหลด...</span>
      </div>
    </div>
  );
}
