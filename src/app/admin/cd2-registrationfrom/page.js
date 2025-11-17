"use client";
import { useEffect, useState } from "react";

export default function Cd2RegistrationFrom() {
  const [dataType, setDataType] = useState("performances"); 
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch either performances or stalls based on the toggle
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await fetch(`/api/${dataType}`);
        const result = await response.json();
        if (response.ok) {
          setData(result.data);
        } else {
          setError(result.error || "Failed to fetch data");
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [dataType]);

const ToggleSwitch = () => (
  <div className="flex justify-center mb-6">
    <div className="relative inline-flex items-center w-[170px] h-10 bg-blue-100 rounded-full shadow-sm">
      <button
        className={`absolute left-0 w-[85px] h-10 rounded-full transition-all duration-300 outline-none
          ${
            dataType === "performances"
              ? "bg-blue-600 text-white font-bold shadow-lg"
              : "bg-transparent text-blue-700 hover:bg-blue-200"
          }`}
        onClick={() => setDataType("performances")}
        disabled={dataType === "performances"}
        aria-pressed={dataType === "performances"}
        style={{ zIndex: 2 }}
      >
        <span className="inline-flex items-center justify-center gap-2">
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path d="M8 12l-4-4 4-4m-4 4h12" />
          </svg>
          Perf
        </span>
      </button>
      <button
        className={`absolute right-0 w-[85px] h-10 rounded-full transition-all duration-300 outline-none
          ${
            dataType === "stalls"
              ? "bg-blue-600 text-white font-bold shadow-lg"
              : "bg-transparent text-blue-700 hover:bg-blue-200"
          }`}
        onClick={() => setDataType("stalls")}
        disabled={dataType === "stalls"}
        aria-pressed={dataType === "stalls"}
        style={{ zIndex: 2 }}
      >
        <span className="inline-flex items-center justify-center gap-2">
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path d="M12 8l4 4-4 4m4-4H4" />
          </svg>
          Stalls
        </span>
      </button>
      {/* Animated slider */}
      <span
        className="absolute top-0 left-0 w-[85px] h-10 bg-blue-600 rounded-full transition-all duration-300"
        style={{
          transform:
            dataType === "performances" ? "translateX(0)" : "translateX(85px)",
          zIndex: 1,
          boxShadow: "0 2px 8px rgba(30, 64, 175, 0.2)",
        }}
      ></span>
    </div>
  </div>
);


  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh] bg-gray-50">
        <div className="flex flex-col items-center gap-4">
          <span className="animate-spin rounded-full h-12 w-12 border-4 border-b-blue-600 border-t-gray-300"></span>
          <p className="text-gray-600 text-lg font-semibold">Loading...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[60vh] bg-gray-50">
        <div className="p-6 rounded-lg border border-red-300 bg-red-50 text-center text-red-700 max-w-xs w-full shadow">
          <p className="font-semibold mb-2">Error</p>
          <p>{error}</p>
        </div>
      </div>
    );
  }

  // Headers for table (based on type)
  const performanceHeaders = [
    "Name",
    "USN Roll",
    "Year",
    "Department",
    "Email",
    "Phone",
    "Type",
    "Team Size",
    "Desc",
    "Created At",
  ];
  const stallHeaders = [
    "Name",
    "USN Roll",
    "Year",
    "Department",
    "Email",
    "Phone",
    "Hosting Type",
    "Team Size",
    "Stall Name",
    "Food",
    "Games",
    "Art",
    "Merch",
    "Other Category",
    "Desc",
    "Req Table",
    "Req Electricity",
    "Req Other",
    "Req Tables",
    "Category",
    "Created At",
  ];

  // Desktop/tablet table view
  const renderTable = () => {
    if (dataType === "performances") {
      return (
        <div className="overflow-auto rounded-lg shadow border border-gray-200">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-blue-50 sticky top-0 z-10">
              <tr>
                {performanceHeaders.map((title) => (
                  <th
                    key={title}
                    className="p-3 font-semibold text-gray-700 text-left"
                  >
                    {title}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-100">
              {data.map((perf) => (
                <tr
                  key={perf.id}
                  className="hover:bg-blue-50 transition-all duration-120"
                >
                  <td className="p-3">{perf.full_name}</td>
                  <td className="p-3">{perf.usn_roll}</td>
                  <td className="p-3">{perf.year_of_study}</td>
                  <td className="p-3">{perf.department}</td>
                  <td className="p-3 whitespace-nowrap">{perf.email}</td>
                  <td className="p-3 whitespace-nowrap">{perf.phone_number}</td>
                  <td className="p-3">{perf.performance_type}</td>
                  <td className="p-3 text-center">{perf.team_size}</td>
                  <td className="p-3">{perf.performance_description}</td>
                  <td className="p-3 whitespace-nowrap">
                    {new Date(perf.created_at).toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {data.length === 0 && (
            <div className="p-6 text-gray-500 text-center">
              No performances found.
            </div>
          )}
        </div>
      );
    } else {
      return (
        <div className="overflow-auto rounded-lg shadow border border-gray-200">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-blue-50 sticky top-0 z-10">
              <tr>
                {stallHeaders.map((title) => (
                  <th
                    key={title}
                    className="p-3 font-semibold text-gray-700 text-left"
                  >
                    {title}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-100">
              {data.map((stall) => (
                <tr
                  key={stall.id}
                  className="hover:bg-blue-50 transition-all duration-120"
                >
                  <td className="p-3">{stall.full_name}</td>
                  <td className="p-3">{stall.usn_roll}</td>
                  <td className="p-3">{stall.year_of_study}</td>
                  <td className="p-3">{stall.department}</td>
                  <td className="p-3 whitespace-nowrap">{stall.email}</td>
                  <td className="p-3 whitespace-nowrap">
                    {stall.phone_number}
                  </td>
                  <td className="p-3">{stall.hosting_type}</td>
                  <td className="p-3">{stall.team_size}</td>
                  <td className="p-3">{stall.stall_name}</td>
                  <td className="p-3">{stall.category_food ? "Yes" : ""}</td>
                  <td className="p-3">{stall.category_games ? "Yes" : ""}</td>
                  <td className="p-3">{stall.category_art ? "Yes" : ""}</td>
                  <td className="p-3">{stall.category_merch ? "Yes" : ""}</td>
                  <td className="p-3">{stall.category_other ? "Yes" : ""}</td>
                  <td className="p-3">{stall.description}</td>
                  <td className="p-3">{stall.req_table ? "Yes" : ""}</td>
                  <td className="p-3">{stall.req_electricity ? "Yes" : ""}</td>
                  <td className="p-3">{stall.req_other ? "Yes" : ""}</td>
                  <td className="p-3">{stall.req_tables ? "Yes" : ""}</td>
                  <td className="p-3">{stall.category}</td>
                  <td className="p-3 whitespace-nowrap">
                    {new Date(stall.created_at).toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {data.length === 0 && (
            <div className="p-6 text-gray-500 text-center">
              No stalls found.
            </div>
          )}
        </div>
      );
    }
  };

  // Mobile card view
  const renderCards = () => {
    if (dataType === "performances") {
      return data.length === 0 ? (
        <div className="p-6 text-gray-500 text-center">
          No performances found.
        </div>
      ) : (
        data.map((perf) => (
          <div
            key={perf.id}
            className="border rounded-lg shadow-sm bg-white p-4"
          >
            <h3 className="font-semibold text-lg text-blue-900 mb-2">
              {perf.full_name}
            </h3>
            <div className="text-gray-700 text-sm mb-2">
              <span className="font-medium">USN Roll:</span> {perf.usn_roll}
            </div>
            <div className="text-gray-700 text-sm mb-2">
              <span className="font-medium">Year:</span> {perf.year_of_study}
            </div>
            <div className="text-gray-700 text-sm mb-2">
              <span className="font-medium">Department:</span> {perf.department}
            </div>
            <div className="text-gray-700 text-sm mb-2">
              <span className="font-medium">Email:</span> {perf.email}
            </div>
            <div className="text-gray-700 text-sm mb-2">
              <span className="font-medium">Phone:</span> {perf.phone_number}
            </div>
            <div className="text-gray-700 text-sm mb-2">
              <span className="font-medium">Type:</span> {perf.performance_type}
            </div>
            <div className="text-gray-700 text-sm mb-2">
              <span className="font-medium">Team Size:</span> {perf.team_size}
            </div>
            <div className="text-gray-700 text-sm mb-2">
              <span className="font-medium">Desc:</span>{" "}
              {perf.performance_description}
            </div>
            <div className="text-gray-500 text-xs">
              <span className="font-medium">Created At:</span>{" "}
              {new Date(perf.created_at).toLocaleString()}
            </div>
          </div>
        ))
      );
    } else {
      return data.length === 0 ? (
        <div className="p-6 text-gray-500 text-center">No stalls found.</div>
      ) : (
        data.map((stall) => (
          <div
            key={stall.id}
            className="border rounded-lg shadow-sm bg-white p-4"
          >
            <h3 className="font-semibold text-lg text-blue-900 mb-2">
              {stall.stall_name}
            </h3>
            <div className="text-gray-700 text-sm mb-2">
              <span className="font-medium">Name:</span> {stall.full_name}
            </div>
            <div className="text-gray-700 text-sm mb-2">
              <span className="font-medium">USN Roll:</span> {stall.usn_roll}
            </div>
            <div className="text-gray-700 text-sm mb-2">
              <span className="font-medium">Year:</span> {stall.year_of_study}
            </div>
            <div className="text-gray-700 text-sm mb-2">
              <span className="font-medium">Department:</span>{" "}
              {stall.department}
            </div>
            <div className="text-gray-700 text-sm mb-2">
              <span className="font-medium">Email:</span> {stall.email}
            </div>
            <div className="text-gray-700 text-sm mb-2">
              <span className="font-medium">Phone:</span> {stall.phone_number}
            </div>
            <div className="text-gray-700 text-sm mb-2">
              <span className="font-medium">Hosting Type:</span>{" "}
              {stall.hosting_type}
            </div>
            <div className="text-gray-700 text-sm mb-2">
              <span className="font-medium">Team Size:</span> {stall.team_size}
            </div>
            <div className="text-gray-700 text-sm mb-2">
              <span className="font-medium">Food:</span>{" "}
              {stall.category_food ? "Yes" : "No"}
            </div>
            <div className="text-gray-700 text-sm mb-2">
              <span className="font-medium">Games:</span>{" "}
              {stall.category_games ? "Yes" : "No"}
            </div>
            <div className="text-gray-700 text-sm mb-2">
              <span className="font-medium">Art:</span>{" "}
              {stall.category_art ? "Yes" : "No"}
            </div>
            <div className="text-gray-700 text-sm mb-2">
              <span className="font-medium">Merch:</span>{" "}
              {stall.category_merch ? "Yes" : "No"}
            </div>
            <div className="text-gray-700 text-sm mb-2">
              <span className="font-medium">Other Category:</span>{" "}
              {stall.category_other ? "Yes" : "No"}
            </div>
            <div className="text-gray-700 text-sm mb-2">
              <span className="font-medium">Desc:</span> {stall.description}
            </div>
            <div className="text-gray-700 text-sm mb-2">
              <span className="font-medium">Req Table:</span>{" "}
              {stall.req_table ? "Yes" : "No"}
            </div>
            <div className="text-gray-700 text-sm mb-2">
              <span className="font-medium">Req Electricity:</span>{" "}
              {stall.req_electricity ? "Yes" : "No"}
            </div>
            <div className="text-gray-700 text-sm mb-2">
              <span className="font-medium">Req Other:</span>{" "}
              {stall.req_other ? "Yes" : "No"}
            </div>
            <div className="text-gray-700 text-sm mb-2">
              <span className="font-medium">Req Tables:</span>{" "}
              {stall.req_tables ? "Yes" : "No"}
            </div>
            <div className="text-gray-700 text-sm mb-2">
              <span className="font-medium">Category:</span> {stall.category}
            </div>
            <div className="text-gray-500 text-xs">
              <span className="font-medium">Created At:</span>{" "}
              {new Date(stall.created_at).toLocaleString()}
            </div>
          </div>
        ))
      );
    }
  };

  return (
    <section className="max-w-7xl mx-auto w-full px-2 md:px-8 pt-8 pb-4">
      <h2 className="text-2xl md:text-3xl font-extrabold mb-6 text-gray-900 text-center">
        CD2{" "}
        {dataType === "performances"
          ? "Performances Registration Data"
          : "Stalls Registration Data"}
      </h2>

      <ToggleSwitch />

      {/* Table for desktop/tablet */}
      <div className="hidden md:block">{renderTable()}</div>
      {/* Card for mobile */}
      <div className="md:hidden grid gap-4">{renderCards()}</div>
    </section>
  );
}
