import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Menu } from "@headlessui/react";
import { UserIcon, ChevronDownIcon } from "@heroicons/react/24/solid";
import axios from "axios";
import Papa from "papaparse";

const API_URL = "http://localhost:5000/api"; // Base URL of your backend

const Dashboard = () => {
  const navigate = useNavigate();
  const [accountId, setAccountId] = useState(null);
  const [balance, setBalance] = useState(0);
  const [transactions, setTransactions] = useState([]);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login-signup");
    } else {
      fetchAccountData();
    }
  }, [navigate]);

  const fetchAccountData = async () => {
    try {
      const accessToken = localStorage.getItem("plaid_access_token");
      if (!accessToken) return;

      // Fetch Account Balance
      const accountRes = await axios.get(`${API_URL}/accounts/balance`, {
        params: { access_token: accessToken },
      });

      // Fetch Transactions
      const transactionRes = await axios
        .get(`${API_URL}/transactions`, {
          params: { access_token: accessToken },
        })
        .catch((error) => {
          console.error("Error fetching transactions:", error);
          return { data: { transactions: [] } };
        });

      console.log("Complete Transaction Response:", transactionRes.data);

      setTransactions(transactionRes.data.transactions || []);

      if (accountRes.data.length > 0) {
        setAccountId(accountRes.data[0].account_id);
        setBalance(accountRes.data[0].balances.current);
      }
    } catch (error) {
      console.error("Error fetching account data:", error);
      setTransactions([]);
    }
  };

  const linkBankAccount = async () => {
    try {
      const res = await axios.post(`${API_URL}/create_link_token`);
      const { link_token } = res.data;

      if (link_token && window.Plaid) {
        const plaidHandler = window.Plaid.create({
          token: link_token,
          onSuccess: async (public_token) => {
            try {
              const exchangeRes = await axios.post(
                `${API_URL}/exchange_public_token`,
                { public_token }
              );
              localStorage.setItem(
                "plaid_access_token",
                exchangeRes.data.access_token
              );
              fetchAccountData();
            } catch (error) {
              console.error("Error exchanging public token:", error);
            }
          },
        });

        plaidHandler.open();
      } else {
        console.error("Plaid SDK not loaded or link token missing.");
      }
    } catch (error) {
      console.error("Error linking bank account:", error);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("plaid_access_token");
    navigate("/");
  };

  // Function to download transactions as CSV
  const downloadCSV = () => {
    const csv = Papa.unparse(transactions);
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", "transactions.csv");
    link.click();
  };

  return (
    <div className="min-h-screen bg-gradient-to-r from-sky-100 to-green-100 animate-gradient-xy">
      <nav className="bg-sky-200 shadow p-4 flex justify-between items-center">
        <div className="text-xl font-bold text-sky-800">FinDash</div>
        <div className="flex space-x-6">
          <Link to="/dashboard" className="hover:text-sky-700">
            Dashboard
          </Link>
          <Link to="/ai-insights" className="hover:text-sky-700">
           AI Insights
        </Link>
          <Link to="/expense-breakdown" className="hover:text-sky-700">
            Expense Breakdown
          </Link>
          <Link to="/assets" className="hover:text-sky-700">
         Assets
         </Link>

        </div>
        <div className="relative">
          <Menu>
            <Menu.Button className="flex items-center space-x-2">
              <UserIcon className="w-8 h-8 text-sky-800" />
              <ChevronDownIcon className="w-4 h-4 text-sky-800" />
            </Menu.Button>
            <Menu.Items className="absolute right-0 mt-2 w-48 bg-white shadow-md rounded-md py-1">
              <Menu.Item>
                {({ active }) => (
                  <button
                    className={`block w-full text-left px-4 py-2 ${
                      active ? "bg-sky-100" : ""
                    }`}
                  >
                    User Details
                  </button>
                )}
              </Menu.Item>
              <Menu.Item>
                {({ active }) => (
                  <button
                    onClick={handleLogout}
                    className={`block w-full text-left px-4 py-2 ${
                      active ? "bg-sky-100" : ""
                    }`}
                  >
                    Logout
                  </button>
                )}
              </Menu.Item>
            </Menu.Items>
          </Menu>
        </div>
      </nav>

      <div className="p-8">
        <h2 className="text-2xl font-semibold mb-4 text-sky-800">
          Financial Summary
        </h2>

        <div className="grid grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-lg shadow-md border border-sky-100">
            <h3 className="text-xl font-semibold text-sky-800">Account ID</h3>
            <p className="text-2xl font-bold text-sky-900 overflow-x-auto whitespace-nowrap max-w-full scrollbar-thin scrollbar-thumb-sky-400">
              {accountId || "N/A"}
            </p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-md border border-sky-100">
            <h3 className="text-xl font-semibold text-sky-800">
              Current Balance
            </h3>
            <p className="text-2xl font-bold text-sky-900">
              ${balance.toFixed(2)}
            </p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-md border border-sky-100">
            <h3 className="text-xl font-semibold text-sky-800">Transactions</h3>
            <p className="text-2xl font-bold text-sky-900">
              {transactions?.length || 0}
            </p>

            <button
              onClick={linkBankAccount}
              className="mt-4 px-4 py-2 bg-sky-600 text-white rounded-lg hover:bg-sky-700"
            >
              Link Bank Account
            </button>
          </div>
        </div>

        <h2 className="text-2xl font-semibold mt-8 mb-4 text-sky-800">
          Recent Transactions
        </h2>
        <div className="bg-white p-6 rounded-lg shadow-lg border border-sky-100">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse border border-sky-200">
              <thead>
                <tr className="bg-sky-100">
                  <th className="border p-3 text-left text-sky-800">Date</th>
                  <th className="border p-3 text-left text-sky-800">
                    Merchant
                  </th>
                  <th className="border p-3 text-left text-sky-800">
                    Category
                  </th>
                  <th className="border p-3 text-right text-sky-800">Amount</th>
                </tr>
              </thead>
              <tbody>
                {transactions.length > 0 ? (
                  transactions.map((transaction, index) => (
                    <tr
                      key={index}
                      className={index % 2 === 0 ? "bg-sky-50" : "bg-white"}
                    >
                      <td className="border p-3 text-sky-900">
                        {transaction.date}
                      </td>
                      <td className="border p-3 text-sky-900">
                        {transaction.merchant_name || "N/A"}
                      </td>
                      <td className="border p-3 text-sky-900">
                        {transaction.category?.[0] || "N/A"}
                      </td>
                      <td className="border p-3 text-right text-sky-900">
                        ${transaction.amount.toFixed(2)}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan="4"
                      className="border p-3 text-center text-sky-900"
                    >
                      No transactions available.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          <button
            onClick={downloadCSV}
            className="mt-4 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
          >
            Download Transactions as CSV
          </button>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;