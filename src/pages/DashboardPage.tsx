import { motion } from "framer-motion";
import { Users, UserPlus, CalendarCheck, UserCheck } from "lucide-react";
import { Lang, t } from "@/lib/i18n";
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

// Mock data
const mockStats = { visitors: 1247, leads: 89, bookings: 34, customers: 12 };
const mockChart = [
  { name: "Jan", leads: 12 }, { name: "Feb", leads: 19 }, { name: "Mar", leads: 25 },
  { name: "Apr", leads: 22 }, { name: "May", leads: 31 }, { name: "Jun", leads: 89 },
];
const mockLeads = [
  { name: "Anna Svensson", email: "anna@test.se", status: "New", date: "2026-03-15" },
  { name: "Erik Johansen", email: "erik@test.no", status: "Contacted", date: "2026-03-14" },
  { name: "Mika Virtanen", email: "mika@test.fi", status: "Booked", date: "2026-03-13" },
  { name: "Lars Nielsen", email: "lars@test.dk", status: "Customer", date: "2026-03-12" },
];

const statusColor: Record<string, string> = {
  New: "bg-primary/10 text-primary",
  Contacted: "bg-accent text-accent-foreground",
  Booked: "bg-primary/20 text-primary",
  Customer: "bg-primary text-primary-foreground",
};

export default function DashboardPage({ lang }: DashboardPageProps) {
  const tr = t(lang);

  const statCards = [
    { icon: Users, label: tr.dashboard.visitors, value: mockStats.visitors },
    { icon: UserPlus, label: tr.dashboard.leads, value: mockStats.leads },
    { icon: CalendarCheck, label: tr.dashboard.bookings, value: mockStats.bookings },
    { icon: UserCheck, label: tr.dashboard.customers, value: mockStats.customers },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-secondary/20">
      <Header lang={lang} />
      <main className="flex-1 py-10">
        <div className="container">
          <motion.h1 initial="hidden" animate="visible" variants={fadeUp} custom={0} className="text-3xl font-bold text-foreground">{tr.dashboard.title}</motion.h1>

          {/* Stats */}
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

          {/* Chart + Table */}
          <div className="mt-8 grid gap-6 lg:grid-cols-2">
            <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} custom={0}>
              <Card className="shadow-sm">
                <CardHeader>
                  <CardTitle className="text-lg text-foreground">{tr.dashboard.performance}</CardTitle>
                </CardHeader>
                <CardContent className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={mockChart}>
                      <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                      <XAxis dataKey="name" className="text-muted-foreground" tick={{ fontSize: 12 }} />
                      <YAxis className="text-muted-foreground" tick={{ fontSize: 12 }} />
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
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="text-muted-foreground">{tr.lead.name}</TableHead>
                        <TableHead className="text-muted-foreground">Status</TableHead>
                        <TableHead className="text-muted-foreground hidden sm:table-cell">{tr.lead.email}</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {mockLeads.map((lead, i) => (
                        <TableRow key={i}>
                          <TableCell className="font-medium text-foreground">{lead.name}</TableCell>
                          <TableCell>
                            <Badge variant="secondary" className={statusColor[lead.status]}>{lead.status}</Badge>
                          </TableCell>
                          <TableCell className="text-muted-foreground hidden sm:table-cell">{lead.email}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
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
