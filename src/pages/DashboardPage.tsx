import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Users, UserPlus, CalendarCheck, UserCheck } from "lucide-react";
import { Lang, t } from "@/lib/i18n";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: (i: number) => ({ opacity: 1, y: 0, transition: { delay: i * 0.1, duration: 0.5 } }),
};

interface DashboardPageProps {
  lang: Lang;
}

const statusColor: Record<string, string> = {
  new: "bg-primary/10 text-primary",
  contacted: "bg-accent text-accent-foreground",
  booked: "bg-primary/20 text-primary",
  test_ordered: "bg-primary/30 text-primary",
  customer: "bg-primary text-primary-foreground",
  partner: "bg-accent text-accent-foreground",
};

export default function DashboardPage({ lang }: DashboardPageProps) {
  const tr = t(lang);
  const [stats, setStats] = useState({ visitors: 0, leads: 0, bookings: 0, customers: 0 });
  const [leads, setLeads] = useState<any[]>([]);
  const [chartData, setChartData] = useState<any[]>([]);

  useEffect(() => {
    async function load() {
      const [leadsRes, visitsRes] = await Promise.all([
        supabase.from("leads").select("*").order("created_at", { ascending: false }).limit(10),
        supabase.from("partner_visits").select("id"),
      ]);

      const allLeads = leadsRes.data || [];
      setLeads(allLeads.slice(0, 5));

      setStats({
        visitors: visitsRes.data?.length || 0,
        leads: allLeads.length,
        bookings: allLeads.filter(l => l.status === "booked").length,
        customers: allLeads.filter(l => l.status === "customer").length,
      });

      // Group leads by month for chart
      const months: Record<string, number> = {};
      allLeads.forEach(l => {
        const m = new Date(l.created_at).toLocaleString("default", { month: "short" });
        months[m] = (months[m] || 0) + 1;
      });
      setChartData(Object.entries(months).map(([name, leads]) => ({ name, leads })));
    }
    load();
  }, []);

  const statCards = [
    { icon: Users, label: tr.dashboard.visitors, value: stats.visitors },
    { icon: UserPlus, label: tr.dashboard.leads, value: stats.leads },
    { icon: CalendarCheck, label: tr.dashboard.bookings, value: stats.bookings },
    { icon: UserCheck, label: tr.dashboard.customers, value: stats.customers },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-secondary/20">
      <Header lang={lang} />
      <main className="flex-1 py-10">
        <div className="container">
          <motion.h1 initial="hidden" animate="visible" variants={fadeUp} custom={0} className="text-3xl font-bold text-foreground">{tr.dashboard.title}</motion.h1>

          <motion.div initial="hidden" animate="visible" className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {statCards.map((s, i) => (
              <motion.div key={i} variants={fadeUp} custom={i + 1}>
                <Card className="shadow-sm hover:shadow-md transition-shadow">
                  <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">{s.label}</CardTitle>
                    <s.icon className="h-5 w-5 text-primary" />
                  </CardHeader>
                  <CardContent>
                    <p className="text-3xl font-bold text-foreground">{s.value.toLocaleString()}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </motion.div>

          <div className="mt-8 grid gap-6 lg:grid-cols-2">
            <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} custom={0}>
              <Card className="shadow-sm">
                <CardHeader>
                  <CardTitle className="text-lg text-foreground">{tr.dashboard.performance}</CardTitle>
                </CardHeader>
                <CardContent className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={chartData.length ? chartData : [{ name: "-", leads: 0 }]}>
                      <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                      <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                      <YAxis tick={{ fontSize: 12 }} />
                      <Tooltip />
                      <Bar dataKey="leads" fill="hsl(172, 50%, 36%)" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} custom={1}>
              <Card className="shadow-sm">
                <CardHeader>
                  <CardTitle className="text-lg text-foreground">{tr.dashboard.recent}</CardTitle>
                </CardHeader>
                <CardContent>
                  {leads.length === 0 ? (
                    <p className="text-sm text-muted-foreground py-4 text-center">No leads yet</p>
                  ) : (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="text-muted-foreground">{tr.lead.name}</TableHead>
                          <TableHead className="text-muted-foreground">Status</TableHead>
                          <TableHead className="text-muted-foreground hidden sm:table-cell">{tr.lead.email}</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {leads.map((lead) => (
                          <TableRow key={lead.id}>
                            <TableCell className="font-medium text-foreground">{lead.name}</TableCell>
                            <TableCell>
                              <Badge variant="secondary" className={statusColor[lead.status] || ""}>{lead.status}</Badge>
                            </TableCell>
                            <TableCell className="text-muted-foreground hidden sm:table-cell">{lead.email}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>
      </main>
      <Footer lang={lang} />
    </div>
  );
}
