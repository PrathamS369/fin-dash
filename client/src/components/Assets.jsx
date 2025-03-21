import React, { useState, useEffect } from "react";
import Papa from "papaparse";
import axios from "axios";

const Assets = () => {
  const [csvData, setCsvData] = useState([]);
  const [loading, setLoading] = useState(false);

  // Fetch CSV Data on Component Load
  useEffect(() => {
    fetchCsvData();
  }, []);

  // Handle CSV File Upload
  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: async (result) => {
        setCsvData(result.data);
        setLoading(true);

        // Save CSV Data to Backend
        try {
          await axios.post("http://localhost:5000/api/assets/upload-dynamic", {
            userId: 1,  // Replace with dynamic user ID
            csvData: result.data,
          });
          alert("CSV Data Saved Successfully");
          fetchCsvData(); // Refresh Data
        } catch (error) {
          console.error("Error saving data:", error.stack);
        } finally {
          setLoading(false);
        }
      },
    });
  };

  // Fetch CSV Data from Backend
  const fetchCsvData = async () => {
    setLoading(true);
    try {
      const response = await axios.get("http://localhost:5000/api/assets", {
        params: { userId: 1 }, // Replace with dynamic user ID
      });
      setCsvData(response.data);
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-r from-sky-300 to-green-300 p-8">
      <h2 className="text-3xl font-bold mb-4 text-green-800">
        Upload and View CSV Data
      </h2>
      
      <input
        type="file"
        accept=".csv"
        onChange={handleFileUpload}
        className="mb-4 file:bg-green-600 file:text-white file:rounded-lg file:px-4 file:py-2 file:cursor-pointer hover:file:bg-green-700"
      />

      {loading ? (
        <p>Loading...</p>
      ) : (
        csvData.length > 0 && (
          <div className="bg-white p-6 rounded-lg shadow-lg mt-4 overflow-x-auto">
            <table className="w-full border-collapse border border-gray-200">
              <thead>
                <tr className="bg-green-200">
                  {Object.keys(csvData[0]).map((header, index) => (
                    <th key={index} className="border p-3 text-left">
                      {header}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {csvData.map((row, rowIndex) => (
                  <tr key={rowIndex} className="hover:bg-sky-100">
                    {Object.values(row).map((value, colIndex) => (
                      <td key={colIndex} className="border p-3">
                        {value}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )
      )}
    </div>
  );
};

export default Assets;