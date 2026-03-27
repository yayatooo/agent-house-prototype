export const currentUser = {
  name: "Samantha",
  role: "admin",
  email: "samantha@email.com",
  avatar: "/avatars/samantha.jpg",
  notifications: 4,
};

export const navItems = [
  { label: "Dashboard", href: "/admin/mainpage", icon: "LayoutDashboard" },
  { label: "Branch", href: "/admin/branch", icon: "Building2" },
  { label: "Unit", href: "/admin/unit", icon: "Home" },
  { label: "Team Sales", href: "/admin/sales", icon: "Users" },
  { label: "Accounts", href: "/admin/account", icon: "UserCog" },
  { label: "Settings", href: "/admin/settings", icon: "Settings" },
];

export const todayTransactions = [
  {
    id: 1,
    source: "Branch A",
    time: "5:12 pm",
    description: "Belanja di pasar",
    amount: -326800,
    icon: "ShoppingCart",
    color: "bg-blue-500",
  },
  {
    id: 2,
    source: "Branch B",
    time: "5:12 pm",
    description: "Naik bus umum",
    amount: -15000,
    icon: "Bus",
    color: "bg-emerald-500",
  },
  {
    id: 3,
    source: "Etc",
    time: "5:12 pm",
    description: "Bayar Listrik",
    amount: -185750,
    icon: "Home",
    color: "bg-orange-500",
  },
];

export const monthlySales = [
  {
    id: 1,
    unit: "Unit A",
    time: "5:12 pm",
    salesPerson: "Sales A",
    amount: -156000,
    color: "bg-red-500",
  },
  {
    id: 2,
    unit: "Unit B",
    time: "5:12 pm",
    salesPerson: "Sales B",
    amount: -35200,
    color: "bg-indigo-500",
  },
];

export const leaderboard = [
  { name: "Sales A", amount: 872400, percentage: 63 },
  { name: "Sales B", amount: 1378200, percentage: 100 },
  { name: "Sales C", amount: 928500, percentage: 67 },
  { name: "Sales D", amount: 420700, percentage: 30 },
  { name: "Sales E", amount: 520000, percentage: 38 },
];

export const dailySalesChart = Array.from({ length: 25 }, (_, i) => ({
  day: i + 1,
  sales: Math.floor(Math.random() * 500000) + 100000,
  isHighlighted: i === 19, // day 20 highlighted
}));
