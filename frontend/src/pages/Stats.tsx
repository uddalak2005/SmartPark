import { Card } from "@/components/ui/card";
import { Fuel, Clock, Car, TrendingUp } from "lucide-react";
import DashboardLayout from "@/components/dashboard/DashboardLayout";

const Stats = () => {
  const stats = [
    {
      icon: Fuel,
      label: "Fuel Saved",
      value: "45.2 gal",
      change: "+12% this month",
      positive: true,
    },
    {
      icon: Clock,
      label: "Hours Parked",
      value: "127 hrs",
      change: "This month",
      positive: true,
    },
    {
      icon: Car,
      label: "Total Trips",
      value: "84",
      change: "+8 from last month",
      positive: true,
    },
    {
      icon: TrendingUp,
      label: "Cost Savings",
      value: "$342",
      change: "+15% efficiency",
      positive: true,
    },
  ];

  return (
    <DashboardLayout>
      <div className="max-w-6xl mx-auto">
        <h2 className="text-2xl font-bold mb-6">Your Parking Statistics</h2>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat, index) => (
            <Card key={index} className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center">
                  <stat.icon className="h-6 w-6 text-primary" />
                </div>
              </div>
              <p className="text-sm text-muted-foreground mb-1">{stat.label}</p>
              <p className="text-3xl font-bold mb-2">{stat.value}</p>
              <p className={`text-sm ${stat.positive ? "text-primary" : "text-muted-foreground"}`}>
                {stat.change}
              </p>
            </Card>
          ))}
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Recent Activity</h3>
            <div className="space-y-4">
              {[
                { location: "Central Plaza", date: "Today, 2:30 PM", duration: "2h 15m" },
                { location: "Metro Station", date: "Yesterday, 9:00 AM", duration: "4h 30m" },
                { location: "Park & Ride Hub", date: "Dec 10, 3:45 PM", duration: "1h 45m" },
              ].map((activity, index) => (
                <div key={index} className="flex justify-between items-center pb-4 border-b last:border-0">
                  <div>
                    <p className="font-medium">{activity.location}</p>
                    <p className="text-sm text-muted-foreground">{activity.date}</p>
                  </div>
                  <span className="text-sm font-medium text-primary">{activity.duration}</span>
                </div>
              ))}
            </div>
          </Card>

          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Monthly Overview</h3>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between mb-2">
                  <span className="text-sm text-muted-foreground">Parking Efficiency</span>
                  <span className="text-sm font-medium">92%</span>
                </div>
                <div className="h-2 bg-secondary rounded-full overflow-hidden">
                  <div className="h-full bg-primary" style={{ width: "92%" }} />
                </div>
              </div>
              <div>
                <div className="flex justify-between mb-2">
                  <span className="text-sm text-muted-foreground">Cost Optimization</span>
                  <span className="text-sm font-medium">85%</span>
                </div>
                <div className="h-2 bg-secondary rounded-full overflow-hidden">
                  <div className="h-full bg-primary" style={{ width: "85%" }} />
                </div>
              </div>
              <div>
                <div className="flex justify-between mb-2">
                  <span className="text-sm text-muted-foreground">Time Saved</span>
                  <span className="text-sm font-medium">78%</span>
                </div>
                <div className="h-2 bg-secondary rounded-full overflow-hidden">
                  <div className="h-full bg-primary" style={{ width: "78%" }} />
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Stats;
