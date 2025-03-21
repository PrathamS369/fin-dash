import React, { useEffect, useState } from "react";
import {
  ScatterChart,
  Scatter,
  CartesianGrid,
  Tooltip,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const API_URL = "http://localhost:5000/api";

const COLORS = [
  "#7dd3fc", // Skyblue
  "#34d399", // Greenish
  "#60a5fa", // Light blue
  "#4ade80", // Light green
  "#38bdf8", // Bright skyblue
  "#22d3ee", // Teal
  "#6ee7b7", // Mint green
  "#93c5fd", // Soft blue
];

const ExpenseBreakdown = () => {
  const navigate = useNavigate();
  const [transactions, setTransactions] = useState([]);

  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        const accessToken = localStorage.getItem("plaid_access_token");
        if (!accessToken) {
          console.error("Access token not found");
          return;
        }

        const transactionRes = await axios.get(`${API_URL}/transactions`, {
          params: { access_token: accessToken },
        });

        console.log("Fetched Transactions:", transactionRes.data);
        setTransactions(
          Array.isArray(transactionRes.data.transactions)
            ? transactionRes.data.transactions
            : []
        );
      } catch (error) {
        console.error("Error fetching transactions:", error);
        setTransactions([]);
      }
    };

    fetchTransactions();
  }, []);

  // Data Transformation for Charts
  const spendingByMerchant = transactions.reduce((acc, txn) => {
    const merchant = txn.merchant_name || txn.name || "Unknown";
    const amount = parseFloat(txn.amount);

    if (!acc[merchant]) {
      acc[merchant] = 0;
    }
    acc[merchant] += amount;
    return acc;
  }, {});

  const spendingByCategory = transactions.reduce((acc, txn) => {
    const categories = txn.category || ["Uncategorized"];
    const amount = parseFloat(txn.amount);

    categories.forEach((category) => {
      if (!acc[category]) {
        acc[category] = 0;
      }
      acc[category] += amount;
    });

    return acc;
  }, {});

  // Format data for charts
  const merchantData = Object.entries(spendingByMerchant).map(([name, total]) => ({
    name,
    total,
  }));
  const categoryData = Object.entries(spendingByCategory).map(([name, total]) => ({
    name,
    value: total,
  }));

  return (
    <div className="p-8 bg-gradient-to-r from-sky-100 to-green-100 min-h-screen">
      <h2 className="text-3xl font-semibold mb-6 text-sky-800">
        Expense Breakdown
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Total Spending by Merchant (Bar Chart) */}
        <div className="bg-white p-6 rounded-lg shadow-lg border border-sky-100">
          <h3 className="text-xl font-semibold mb-4 text-sky-800">
            Total Spending by Merchant
          </h3>
          {merchantData.length > 0 ? (
            <ResponsiveContainer width="100%" height={400}>
              <BarChart data={merchantData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="name" stroke="#475569" />
                <YAxis stroke="#475569" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#f8fafc",
                    border: "1px solid #e2e8f0",
                    borderRadius: "8px",
                  }}
                />
                <Legend />
                <Bar dataKey="total" fill="#7dd3fc" />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-gray-500">No spending data available.</p>
          )}
        </div>

        {/* Category-wise Spending (Scatter Plot) */}
        <div className="bg-white p-6 rounded-lg shadow-lg border border-sky-100">
          <h3 className="text-xl font-semibold mb-4 text-sky-800">
            Category-wise Spending
          </h3>
          {categoryData.length > 0 ? (
            <ResponsiveContainer width="100%" height={400}>
              <ScatterChart>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis
                  type="category"
                  dataKey="name"
                  name="Category"
                  stroke="#475569"
                />
                <YAxis
                  type="number"
                  dataKey="value"
                  name="Amount Spent"
                  stroke="#475569"
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#f8fafc",
                    border: "1px solid #e2e8f0",
                    borderRadius: "8px",
                  }}
                />
                <Scatter name="Spending" data={categoryData}>
                  {categoryData.map((entry, index) => (
                    <circle
                      key={`circle-${index}`}
                      fill={COLORS[index % COLORS.length]}
                      r={12}
                      cx={index * 150 + 100}
                      cy={400 - entry.value / 2}
                      stroke="#fff"
                      strokeWidth={2}
                    />
                  ))}
                </Scatter>
              </ScatterChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-gray-500">No category data available.</p>
          )}
        </div>
      </div>

      <button
        onClick={() => navigate("/dashboard")}
        className="mt-6 px-4 py-2 bg-sky-600 text-white rounded-lg hover:bg-sky-700"
      >
        Back to Dashboard
      </button>
    </div>
  );
};

export default ExpenseBreakdown;