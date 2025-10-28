import React, { useState, useEffect } from 'react';
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { TrendingUp, Users, DollarSign, ShoppingCart, Activity, Calendar, Plus, X, Database } from 'lucide-react';
import './App.css';

function App() {
  const [timeRange, setTimeRange] = useState('week');
  const [showAddSale, setShowAddSale] = useState(false);
  const [showSalesData, setShowSalesData] = useState(false);
  const [salesData, setSalesData] = useState([]);
  
  const [newSale, setNewSale] = useState({
    amount: '',
    category: 'Electronics',
    quantity: 1,
    customerName: '',
    date: new Date().toISOString().split('T')[0]
  });

  useEffect(() => {
    const saved = JSON.parse(localStorage.getItem('salesData') || '[]');
    if (saved.length > 0) {
      setSalesData(saved);
    } else {
      const demoData = [
        { id: 1, amount: 1200, category: 'Electronics', quantity: 2, customerName: 'John Doe', date: new Date(Date.now() - 86400000).toISOString().split('T')[0] },
        { id: 2, amount: 850, category: 'Clothing', quantity: 3, customerName: 'Jane Smith', date: new Date(Date.now() - 172800000).toISOString().split('T')[0] },
        { id: 3, amount: 450, category: 'Food', quantity: 5, customerName: 'Bob Johnson', date: new Date().toISOString().split('T')[0] },
      ];
      setSalesData(demoData);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('salesData', JSON.stringify(salesData));
  }, [salesData]);

  const handleAddSale = () => {
    if (!newSale.customerName || !newSale.amount) return;
    
    const sale = {
      id: Date.now(),
      amount: parseFloat(newSale.amount),
      category: newSale.category,
      quantity: parseInt(newSale.quantity),
      customerName: newSale.customerName,
      date: newSale.date
    };
    setSalesData([...salesData, sale]);
    setNewSale({
      amount: '',
      category: 'Electronics',
      quantity: 1,
      customerName: '',
      date: new Date().toISOString().split('T')[0]
    });
    setShowAddSale(false);
  };

  const deleteSale = (id) => {
    setSalesData(salesData.filter(sale => sale.id !== id));
  };

  const getFilteredSales = () => {
    const now = new Date();
    const days = timeRange === 'week' ? 7 : timeRange === 'month' ? 30 : 90;
    const cutoffDate = new Date(now.getTime() - days * 24 * 60 * 60 * 1000);
    
    return salesData.filter(sale => new Date(sale.date) >= cutoffDate);
  };

  const filteredSales = getFilteredSales();

  const totalRevenue = filteredSales.reduce((sum, sale) => sum + sale.amount, 0);
  const totalOrders = filteredSales.length;
  const uniqueCustomers = new Set(filteredSales.map(s => s.customerName)).size;
  
  const getPreviousPeriodSales = () => {
    const now = new Date();
    const days = timeRange === 'week' ? 7 : timeRange === 'month' ? 30 : 90;
    const cutoffDate = new Date(now.getTime() - days * 24 * 60 * 60 * 1000);
    const previousCutoff = new Date(cutoffDate.getTime() - days * 24 * 60 * 60 * 1000);
    
    return salesData.filter(sale => {
      const saleDate = new Date(sale.date);
      return saleDate >= previousCutoff && saleDate < cutoffDate;
    });
  };

  const previousSales = getPreviousPeriodSales();
  const previousRevenue = previousSales.reduce((sum, sale) => sum + sale.amount, 0);
  const revenueChange = previousRevenue > 0 
    ? (((totalRevenue - previousRevenue) / previousRevenue) * 100).toFixed(1)
    : 0;

  const previousOrders = previousSales.length;
  const ordersChange = previousOrders > 0
    ? (((totalOrders - previousOrders) / previousOrders) * 100).toFixed(1)
    : 0;

  const getDailyData = () => {
    const grouped = {};
    filteredSales.forEach(sale => {
      const date = sale.date;
      if (!grouped[date]) {
        grouped[date] = { date, revenue: 0, orders: 0, customers: new Set() };
      }
      grouped[date].revenue += sale.amount;
      grouped[date].orders += 1;
      grouped[date].customers.add(sale.customerName);
    });

    return Object.values(grouped).map(day => ({
      date: new Date(day.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      revenue: day.revenue,
      orders: day.orders,
      users: day.customers.size
    })).sort((a, b) => new Date(a.date) - new Date(b.date));
  };

  const dailyData = getDailyData();

  const categoryData = () => {
    const categories = {};
    filteredSales.forEach(sale => {
      if (!categories[sale.category]) {
        categories[sale.category] = { name: sale.category, value: 0 };
      }
      categories[sale.category].value += sale.amount;
    });

    const colors = ['#3b82f6', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981'];
    return Object.values(categories).map((cat, idx) => ({
      ...cat,
      color: colors[idx % colors.length]
    }));
  };

  const categories = categoryData();

  const getHourlyData = () => {
    const hours = Array(24).fill(0);
    filteredSales.forEach(sale => {
      const hour = new Date(sale.date).getHours();
      hours[hour] += 1;
    });
    return hours.map((count, hour) => ({
      hour: `${hour}:00`,
      traffic: count
    }));
  };

  const hourlyData = getHourlyData();

  const stats = [
    {
      title: 'Total Revenue',
      value: `$${totalRevenue.toLocaleString()}`,
      change: `${revenueChange >= 0 ? '+' : ''}${revenueChange}%`,
      icon: DollarSign,
      color: '#3b82f6',
      trend: revenueChange >= 0 ? 'up' : 'down'
    },
    {
      title: 'Unique Customers',
      value: uniqueCustomers.toLocaleString(),
      change: '+0%',
      icon: Users,
      color: '#8b5cf6',
      trend: 'up'
    },
    {
      title: 'Total Orders',
      value: totalOrders.toLocaleString(),
      change: `${ordersChange >= 0 ? '+' : ''}${ordersChange}%`,
      icon: ShoppingCart,
      color: '#ec4899',
      trend: ordersChange >= 0 ? 'up' : 'down'
    },
    {
      title: 'Avg Order Value',
      value: totalOrders > 0 ? `$${(totalRevenue / totalOrders).toFixed(2)}` : '$0',
      change: '+0%',
      icon: Activity,
      color: '#f59e0b',
      trend: 'up'
    },
  ];

  return (
    <div className="dashboard-container">
      <div className="dashboard-content">
        <div className="dashboard-header">
          <div>
            <h1 className="dashboard-title">Analytics Dashboard</h1>
            <p className="dashboard-subtitle">Real-time business metrics from your sales data</p>
          </div>
          <div style={{ display: 'flex', gap: '10px' }}>
            <button className="add-btn" onClick={() => setShowSalesData(true)}>
              <Database size={18} />
              View Sales ({salesData.length})
            </button>
            <button className="add-btn" onClick={() => setShowAddSale(true)}>
              <Plus size={18} />
              Add Sale
            </button>
          </div>
        </div>

        {showAddSale && (
          <div className="modal-overlay" onClick={() => setShowAddSale(false)}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h2>Add New Sale</h2>
                <button className="close-btn" onClick={() => setShowAddSale(false)}>
                  <X size={20} />
                </button>
              </div>
              <div className="form-container">
                <div className="form-group">
                  <label>Customer Name</label>
                  <input
                    type="text"
                    value={newSale.customerName}
                    onChange={(e) => setNewSale({...newSale, customerName: e.target.value})}
                  />
                </div>
                <div className="form-group">
                  <label>Amount ($)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={newSale.amount}
                    onChange={(e) => setNewSale({...newSale, amount: e.target.value})}
                  />
                </div>
                <div className="form-group">
                  <label>Category</label>
                  <select
                    value={newSale.category}
                    onChange={(e) => setNewSale({...newSale, category: e.target.value})}
                  >
                    <option>Electronics</option>
                    <option>Clothing</option>
                    <option>Food</option>
                    <option>Books</option>
                    <option>Other</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Quantity</label>
                  <input
                    type="number"
                    value={newSale.quantity}
                    onChange={(e) => setNewSale({...newSale, quantity: e.target.value})}
                  />
                </div>
                <div className="form-group">
                  <label>Date</label>
                  <input
                    type="date"
                    value={newSale.date}
                    onChange={(e) => setNewSale({...newSale, date: e.target.value})}
                  />
                </div>
                <button className="submit-btn" onClick={handleAddSale}>Add Sale</button>
              </div>
            </div>
          </div>
        )}

        {showSalesData && (
          <div className="modal-overlay" onClick={() => setShowSalesData(false)}>
            <div className="modal-content modal-large" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h2>All Sales Data</h2>
                <button className="close-btn" onClick={() => setShowSalesData(false)}>
                  <X size={20} />
                </button>
              </div>
              <div className="sales-table">
                <table>
                  <thead>
                    <tr>
                      <th>Date</th>
                      <th>Customer</th>
                      <th>Category</th>
                      <th>Quantity</th>
                      <th>Amount</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {salesData.length === 0 ? (
                      <tr>
                        <td colSpan="6" style={{textAlign: 'center'}}>No sales data yet</td>
                      </tr>
                    ) : (
                      salesData.map(sale => (
                        <tr key={sale.id}>
                          <td>{new Date(sale.date).toLocaleDateString()}</td>
                          <td>{sale.customerName}</td>
                          <td>{sale.category}</td>
                          <td>{sale.quantity}</td>
                          <td>${sale.amount.toFixed(2)}</td>
                          <td>
                            <button 
                              className="delete-btn"
                              onClick={() => deleteSale(sale.id)}
                            >
                              Delete
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        <div className="time-range-selector">
          {['week', 'month', 'quarter'].map((range) => (
            <button
              key={range}
              onClick={() => setTimeRange(range)}
              className={`time-btn ${timeRange === range ? 'active' : ''}`}
            >
              {range.charAt(0).toUpperCase() + range.slice(1)}
            </button>
          ))}
        </div>

        <div className="stats-grid">
          {stats.map((stat, index) => (
            <div key={index} className="stat-card">
              <div className="stat-header">
                <div className="stat-icon" style={{ backgroundColor: stat.color }}>
                  <stat.icon size={24} color="white" />
                </div>
                <span className={`stat-change ${stat.trend}`}>
                  {stat.change}
                </span>
              </div>
              <h3 className="stat-label">{stat.title}</h3>
              <p className="stat-value">{stat.value}</p>
            </div>
          ))}
        </div>

        <div className="charts-grid">
          <div className="chart-card">
            <h3 className="chart-title">
              <TrendingUp size={20} color="#3b82f6" />
              Revenue Trend
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={dailyData}>
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis dataKey="date" stroke="#94a3b8" />
                <YAxis stroke="#94a3b8" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1e293b',
                    border: '1px solid #334155',
                    borderRadius: '8px',
                    color: '#fff'
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="revenue"
                  stroke="#3b82f6"
                  fillOpacity={1}
                  fill="url(#colorRevenue)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          <div className="chart-card">
            <h3 className="chart-title">Sales by Category</h3>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={categories}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {categories.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1e293b',
                    border: '1px solid #334155',
                    borderRadius: '8px',
                    color: '#fff'
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="charts-full">
          <div className="chart-card">
            <h3 className="chart-title">
              <Users size={20} color="#8b5cf6" />
              Daily Activity
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={dailyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis dataKey="date" stroke="#94a3b8" />
                <YAxis stroke="#94a3b8" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1e293b',
                    border: '1px solid #334155',
                    borderRadius: '8px',
                    color: '#fff'
                  }}
                />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="users"
                  stroke="#8b5cf6"
                  strokeWidth={2}
                  dot={{ fill: '#8b5cf6' }}
                />
                <Line
                  type="monotone"
                  dataKey="orders"
                  stroke="#ec4899"
                  strokeWidth={2}
                  dot={{ fill: '#ec4899' }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

          <div className="chart-card">
            <h3 className="chart-title">
              <Calendar size={20} color="#f59e0b" />
              Sales by Hour
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={hourlyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis dataKey="hour" stroke="#94a3b8" />
                <YAxis stroke="#94a3b8" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1e293b',
                    border: '1px solid #334155',
                    borderRadius: '8px',
                    color: '#fff'
                  }}
                />
                <Bar dataKey="traffic" fill="#f59e0b" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;