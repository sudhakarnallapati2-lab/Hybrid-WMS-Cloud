
import React, { useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";
import {
  PackageSearch,
  Truck,
  Activity,
  ServerCog,
  ArrowRight,
  Loader2,
  Settings2,
  LockKeyhole,
  Database,
  MessageSquareText,
} from "lucide-react";

interface LpnResponse {
  lpn?: string;
  status?: string;
  location?: string;
  last_update?: string;
  recommendation?: string;
  error?: string;
}

interface PickResponse {
  delivery?: string;
  status?: string;
  issue?: string;
  suggestion?: string;
}

interface TopWaitsResponse {
  hours: number;
  top_waits: { event: string; seconds_waited: number }[];
}

interface DBTimeResponse {
  hours: number;
  db_time: { stat: string; seconds: number }[];
}

async function apiGET<T>(base: string, path: string, apiKey: string): Promise<T> {
  const res = await fetch(`${base}${path}`, {
    headers: apiKey ? { "x-api-key": apiKey } : {},
  });
  if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
  return res.json();
}

async function apiPOST<T>(base: string, path: string, apiKey: string, body: any): Promise<T> {
  const res = await fetch(`${base}${path}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(apiKey ? { "x-api-key": apiKey } : {}),
    },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
  return res.json();
}

export default function App() {
  const [baseUrl, setBaseUrl] = useState("http://localhost:8000");
  const [apiKey, setApiKey] = useState("");

  const [lpnId, setLpnId] = useState("");
  const [lpnLoading, setLpnLoading] = useState(false);
  const [lpnData, setLpnData] = useState<LpnResponse | null>(null);
  const [lpnErr, setLpnErr] = useState<string | null>(null);

  const [deliveryId, setDeliveryId] = useState("");
  const [pickLoading, setPickLoading] = useState(false);
  const [pickData, setPickData] = useState<PickResponse | null>(null);
  const [pickErr, setPickErr] = useState<string | null>(null);

  const [awrHours, setAwrHours] = useState(1);
  const [awrLoading, setAwrLoading] = useState(false);
  const [topWaits, setTopWaits] = useState<TopWaitsResponse | null>(null);
  const [dbTime, setDbTime] = useState<DBTimeResponse | null>(null);
  const [awrErr, setAwrErr] = useState<string | null>(null);

  const [ticketText, setTicketText] = useState("");
  const [sumLoading, setSumLoading] = useState(false);
  const [summary, setSummary] = useState<string | null>(null);
  const [sumErr, setSumErr] = useState<string | null>(null);

  const connected = useMemo(() => Boolean(baseUrl), [baseUrl]);

  const handleFetchLpn = async () => {
    setLpnErr(null); setLpnData(null); setLpnLoading(true);
    try {
      const data = await apiGET<LpnResponse>(baseUrl, `/lpn/${encodeURIComponent(lpnId)}`, apiKey);
      setLpnData(data);
    } catch (e: any) {
      setLpnErr(e.message);
    } finally { setLpnLoading(false); }
  };

  const handleFetchPick = async () => {
    setPickErr(null); setPickData(null); setPickLoading(true);
    try {
      const data = await apiGET<PickResponse>(baseUrl, `/pick/status/${encodeURIComponent(deliveryId)}`, apiKey);
      setPickData(data);
    } catch (e: any) {
      setPickErr(e.message);
    } finally { setPickLoading(false); }
  };

  const handleFetchAwr = async () => {
    setAwrErr(null); setAwrLoading(true); setTopWaits(null); setDbTime(null);
    try {
      const waits = await apiGET<TopWaitsResponse>(baseUrl, `/monitor/awr/top-waits?hours=${awrHours}`, apiKey);
      const time = await apiGET<DBTimeResponse>(baseUrl, `/monitor/awr/db-time?hours=${awrHours}`, apiKey);
      setTopWaits(waits); setDbTime(time);
    } catch (e: any) {
      setAwrErr(e.message);
    } finally { setAwrLoading(false); }
  };

  const handleSummarize = async () => {
    setSumErr(null); setSummary(null); setSumLoading(true);
    try {
      const r = await apiPOST<{ summary:string }>(baseUrl, "/ticket/summarize", apiKey, { text: ticketText });
      setSummary(r.summary);
    } catch (e:any) {
      setSumErr(e.message);
    } finally { setSumLoading(false); }
  };

  const pieColors = ["#60a5fa", "#34d399", "#f472b6", "#f59e0b", "#a78bfa", "#f87171"];

  return (
    <div className="min-h-screen bg-background text-foreground p-6 md:p-10">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold tracking-tight">AI WMS Operator Dashboard</h1>
          <p className="text-muted-foreground">Real-time troubleshooting for Oracle R12 WMS</p>
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
          <Button variant="default" className="gap-2"><Settings2 className="w-4 h-4"/> Save</Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-6">
        <motion.div initial={{opacity:0, y:8}} animate={{opacity:1,y:0}} transition={{delay:0.05}}>
          <Card className="rounded-2xl shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base"><PackageSearch className="w-5 h-5"/> LPN Check</CardTitle>
              <CardDescription>Instant LPN status & fix</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex gap-2">
                <Input value={lpnId} onChange={(e)=>setLpnId(e.target.value)} placeholder="Enter LPN (e.g., LPN123)" />
                <Button onClick={handleFetchLpn} disabled={!lpnId || !connected || lpnLoading} className="gap-2">
                  {lpnLoading ? <Loader2 className="w-4 h-4 animate-spin"/> : <ArrowRight className="w-4 h-4"/>}
                  Go
                </Button>
              </div>
              {lpnErr && <p className="text-sm text-destructive">{lpnErr}</p>}
              {lpnData && !lpnData.error && (
                <div className="text-sm space-y-1">
                  <div><span className="text-muted-foreground">LPN:</span> {lpnData.lpn}</div>
                  <div><span className="text-muted-foreground">Status:</span> {lpnData.status}</div>
                  <div><span className="text-muted-foreground">Location:</span> {lpnData.location}</div>
                  <div><span className="text-muted-foreground">Updated:</span> {lpnData.last_update}</div>
                  <div className="pt-1"><span className="text-muted-foreground">Recommendation:</span> {lpnData.recommendation}</div>
                </div>
              )}
              {lpnData?.error && <p className="text-sm text-destructive">{lpnData.error}</p>}
            </CardContent>
          </Card>
        </motion.div>

        <motion.div initial={{opacity:0, y:8}} animate={{opacity:1,y:0}} transition={{delay:0.1}}>
          <Card className="rounded-2xl shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base"><Truck className="w-5 h-5"/> Pick Release</CardTitle>
              <CardDescription>Triage stuck deliveries</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex gap-2">
                <Input value={deliveryId} onChange={(e)=>setDeliveryId(e.target.value)} placeholder="Delivery ID" />
                <Button onClick={handleFetchPick} disabled={!deliveryId || !connected || pickLoading} className="gap-2">
                  {pickLoading ? <Loader2 className="w-4 h-4 animate-spin"/> : <ArrowRight className="w-4 h-4"/>}
                  Go
                </Button>
              </div>
              {pickErr && <p className="text-sm text-destructive">{pickErr}</p>}
              {pickData && (
                <div className="text-sm space-y-1">
                  <div><span className="text-muted-foreground">Delivery:</span> {pickData.delivery}</div>
                  {pickData.issue && <div><span className="text-muted-foreground">Issue:</span> {pickData.issue}</div>}
                  {pickData.status && <div><span className="text-muted-foreground">Status:</span> {pickData.status}</div>}
                  <div className="pt-1"><span className="text-muted-foreground">Suggestion:</span> {pickData.suggestion}</div>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        <motion.div initial={{opacity:0, y:8}} animate={{opacity:1,y:0}} transition={{delay:0.15}}>
          <Card className="rounded-2xl shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base"><Activity className="w-5 h-5"/> AWR Health</CardTitle>
              <CardDescription>DB waits & time (last N hours)</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex gap-2 items-center">
                <Input type="number" min={1} max={24} value={awrHours} onChange={(e)=>setAwrHours(parseInt(e.target.value||"1",10))} className="w-28"/>
                <Button onClick={handleFetchAwr} disabled={!connected || awrLoading} className="gap-2">
                  {awrLoading ? <Loader2 className="w-4 h-4 animate-spin"/> : <ServerCog className="w-4 h-4"/>}
                  Analyze
                </Button>
              </div>
              {awrErr && <p className="text-sm text-destructive">{awrErr}</p>}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="h-44 border rounded-xl p-2">
                  <div className="text-xs text-muted-foreground mb-1">Top Waits (sec)</div>
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={topWaits?.top_waits || []} margin={{ left: 10, right: 10, top: 10, bottom: 10 }}>
                      <XAxis dataKey="event" hide/>
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="seconds_waited" radius={[6,6,0,0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
                <div className="h-44 border rounded-xl p-2">
                  <div className="text-xs text-muted-foreground mb-1">DB Time Breakdown</div>
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={dbTime?.db_time || []} dataKey="seconds" nameKey="stat" outerRadius={70}>
                        {(dbTime?.db_time || []).map((_, i) => (
                          <Cell key={i} fill={pieColors[i % pieColors.length]} />
                        ))}
                      </Pie>
                      <Legend />
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div initial={{opacity:0, y:8}} animate={{opacity:1,y:0}} transition={{delay:0.2}}>
          <Card className="rounded-2xl shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base"><MessageSquareText className="w-5 h-5"/> Ticket Summarizer</CardTitle>
              <CardDescription>Paste ticket/email text to auto-summarize</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              <Textarea rows={4} value={ticketText} onChange={(e)=>setTicketText(e.target.value)} placeholder="Paste ticket details…"/>
              <Button onClick={handleSummarize} disabled={!ticketText || !connected || sumLoading} className="gap-2">
                {sumLoading ? <Loader2 className="w-4 h-4 animate-spin"/> : <ArrowRight className="w-4 h-4"/>}
                Summarize
              </Button>
              {sumErr && <p className="text-sm text-destructive">{sumErr}</p>}
              {summary && (
                <div className="text-sm border rounded-xl p-3 bg-muted/30">
                  {summary}
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>

      <div className="mt-8 text-xs text-muted-foreground flex items-center gap-2">
        <span>Connected:</span>
        <span className={`font-medium ${connected ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"}`}>
          {connected ? baseUrl : "Not configured"}
        </span>
        <span className="mx-1">•</span>
        <span>Use the API key configured on the FastAPI gateway.</span>
      </div>
    </div>
  );
}
