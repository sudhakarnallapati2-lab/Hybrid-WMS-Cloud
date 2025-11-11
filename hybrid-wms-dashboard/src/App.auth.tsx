
import React, { useEffect, useMemo, useState, createContext, useContext } from "react";
import { motion } from "framer-motion";
import {
  Card, CardContent, CardDescription, CardHeader, CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend,
} from "recharts";
import {
  PackageSearch, Truck, Activity, ServerCog, ArrowRight, Loader2, Settings2,
  LockKeyhole, Database, MessageSquareText, LogIn, LogOut, ShieldCheck,
} from "lucide-react";

interface AuthState { token: string | null; roles: string[]; user?: string | null; }
const AuthCtx = createContext<{ auth: AuthState; setAuth: React.Dispatch<React.SetStateAction<AuthState>> }>(
  { auth: { token: null, roles: [], user: null }, setAuth: () => {} }
);
function useAuth(){ return useContext(AuthCtx); }

interface LpnResponse { lpn?: string; status?: string; location?: string; last_update?: string; recommendation?: string; error?: string; }
interface PickResponse { delivery?: string; status?: string; issue?: string; suggestion?: string; }
interface TopWaitsResponse { hours: number; top_waits: { event: string; seconds_waited: number }[]; }
interface DBTimeResponse { hours: number; db_time: { stat: string; seconds: number }[]; }

async function apiGET<T>(base: string, path: string, apiKey: string, token?: string): Promise<T> {
  const headers: Record<string,string> = {};
  if (apiKey) headers["x-api-key"] = apiKey;
  if (token) headers["Authorization"] = `Bearer ${token}`;
  const res = await fetch(`${base}${path}`, { headers });
  if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
  return res.json();
}
async function apiPOST<T>(base: string, path: string, apiKey: string, body: any, token?: string): Promise<T> {
  const headers: Record<string,string> = { "Content-Type": "application/json" };
  if (apiKey) headers["x-api-key"] = apiKey;
  if (token) headers["Authorization"] = `Bearer ${token}`;
  const res = await fetch(`${base}${path}`, { method: "POST", headers, body: JSON.stringify(body) });
  if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
  return res.json();
}

function LoginCard({ baseUrl, apiKey, onSuccess }:{ baseUrl:string; apiKey:string; onSuccess:(token:string, roles:string[], user:string)=>void }){
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string|undefined>();

  const submit = async ()=>{
    setErr(undefined); setLoading(true);
    try{
      const res = await fetch(`${baseUrl}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json", ...(apiKey? {"x-api-key": apiKey}: {}) },
        body: JSON.stringify({ username, password })
      });
      if(!res.ok) throw new Error(`${res.status} ${res.statusText}`);
      const data = await res.json();
      const token = data?.access_token as string;
      const payload = JSON.parse(atob(token.split(".")[1]));
      onSuccess(token, payload.roles || [], payload.sub || username);
    }catch(e:any){ setErr(e.message); }
    finally{ setLoading(false); }
  };

  return (
    <Card className="w-full max-w-md rounded-2xl shadow-lg">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg"><ShieldCheck className="w-5 h-5"/> Sign in</CardTitle>
        <CardDescription>JWT Login (operator1 / support1)</CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        <Input value={username} onChange={(e)=>setUsername(e.target.value)} placeholder="username"/>
        <Input type="password" value={password} onChange={(e)=>setPassword(e.target.value)} placeholder="password"/>
        {err && <p className="text-sm text-red-600">{err}</p>}
        <Button onClick={submit} disabled={!username || !password || loading} className="w-full gap-2">
          {loading? <Loader2 className="w-4 h-4 animate-spin"/> : <LogIn className="w-4 h-4"/>} Login
        </Button>
      </CardContent>
    </Card>
  );
}

export default function AppAuth() {
  const [baseUrl, setBaseUrl] = useState("http://localhost:8000");
  const [apiKey, setApiKey] = useState("");
  const [auth, setAuth] = useState<AuthState>(()=>{
    const t = localStorage.getItem("jwt");
    const roles = JSON.parse(localStorage.getItem("roles")||"[]");
    const user = localStorage.getItem("user");
    return { token: t, roles, user };
  });

  const connected = useMemo(() => Boolean(baseUrl), [baseUrl]);
  useEffect(()=>{
    if(auth.token) localStorage.setItem("jwt", auth.token); else localStorage.removeItem("jwt");
    localStorage.setItem("roles", JSON.stringify(auth.roles || []));
    if(auth.user) localStorage.setItem("user", auth.user); else localStorage.removeItem("user");
  }, [auth]);

  const [lpnId, setLpnId] = useState("");
  const [lpnLoading, setLpnLoading] = useState(false);
  const [lpnData, setLpnData] = useState<LpnResponse | null>(null);
  const [lpnErr, setLpnErr] = useState<string | null>(null);

  const handleFetchLpn = async ()=>{
    setLpnErr(null); setLpnData(null); setLpnLoading(true);
    try{
      const data = await apiGET<LpnResponse>(baseUrl, `/lpn/${encodeURIComponent(lpnId)}`, apiKey, auth.token || undefined);
      setLpnData(data);
    }catch(e:any){ setLpnErr(e.message); }
    finally{ setLpnLoading(false); }
  };

  return (
    <AuthCtx.Provider value={{auth, setAuth}}>
      <div className="min-h-screen bg-background text-foreground p-6 md:p-10">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="space-y-1">
            <h1 className="text-3xl font-bold tracking-tight">AI WMS Dashboard (JWT Mode)</h1>
            <p className="text-muted-foreground text-sm">Login required: operator1/op@123 or support1/sup@123</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-2 w-full md:w-auto">
            <div className="flex items-center gap-2">
              <Database className="w-5 h-5" />
              <Input value={baseUrl} onChange={(e)=>setBaseUrl(e.target.value)} placeholder="http://server:8000" />
            </div>
            <div className="flex items-center gap-2">
              <LockKeyhole className="w-5 h-5" />
              <Input value={apiKey} onChange={(e)=>setApiKey(e.target.value)} placeholder="x-api-key" type="password" />
            </div>
            {auth.token ? (
              <Button variant="secondary" className="gap-2" onClick={()=>setAuth({token:null, roles:[], user:null})}>
                <LogOut className="w-4 h-4"/> Logout
              </Button>
            ) : (
              <Button className="gap-2"><LogIn className="w-4 h-4"/> Login</Button>
            )}
          </div>
        </div>

        {!auth.token && (
          <div className="fixed inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center z-50">
            <LoginCard baseUrl={baseUrl} apiKey={apiKey} onSuccess={(tok, roles, user)=> setAuth({token:tok, roles, user})} />
          </div>
        )}

        <div className="mt-8 text-xs text-muted-foreground flex items-center gap-2">
          <span>User:</span>
          <span className="font-medium">{auth.user || "(not signed in)"}</span>
          <span className="mx-1">•</span>
          <span>Roles:</span>
          <span className="font-medium">{auth.roles.join(", ") || "none"}</span>
        </div>
      </div>
    </AuthCtx.Provider>
  );
}
