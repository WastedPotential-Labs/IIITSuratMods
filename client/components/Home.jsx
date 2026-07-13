import { useNavigate } from "react-router-dom"
import { useEffect } from "react";
import { useAuth } from "../context/Auth";

export default function Home(){
  const nav = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    // Logged-in users land on their dashboard; everyone else goes to login.
    nav(user ? "/dashboard" : "/login", { replace: true });
  }, [nav, user]);

  return null;
}
