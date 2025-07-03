import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@apollo/client";
import { GET_USERS, GET_LOGS } from "../gql/admin-queries";
import { Card } from "../components/ui/Card";
import { io } from "socket.io-client";

interface User {
  id: string;
  email: string;
  name: string;
  role: string;
}

interface Log {
  id: string;
  message: string;
  level: string;
  timestamp: string;
  type: string;
}

export default function AdminPage() {
  const {
    loading: usersLoading,
    error: usersError,
    data: usersData,
  } = useQuery<{ getUsers: User[] }>(GET_USERS);
  const [getLogs, { loading: logsLoading, error: logsError }] = useMutation<
    { logs: Log[] },
    { input: { types: string[] } }
  >(GET_LOGS);
  const [logs, setLogs] = useState<Log[]>([]);
  const JWTToken: string = localStorage.getItem("token") || "";

  useEffect(() => {
    const socket = io(import.meta.env.VITE_BACK_URL, {
      query: { JWTToken },
    });

    socket.on("connect", () => {
      console.log("Connected to socket server");
    });

    socket.on("log", (data) => {
      console.log("data upload : ", data);
      setLogs((prevlogs) => [data, ...prevlogs]);
    });

    socket.on("disconnect", () => {
      console.log("Disconnected from socket server");
    });

    return () => {
      socket.disconnect();
    };
  }, [JWTToken]);

  useEffect(() => {
    getLogs({ variables: { input: { types: [] } } }).then((response) => {
      if (response.data) {
        setLogs(response.data.logs);
      }
    });
  }, [getLogs]);

  return (
    <div className="dashboard-home">
      <div className="page-header">
        <div>
          <h1 className="page-title">Admin Dashboard</h1>
          <p className="page-subtitle">Manage users and view system logs</p>
        </div>
      </div>

      <div className="stats-grid">
        <Card className="stat-card">
          <div className="stat-header">
            <h3 className="stat-title">Users</h3>
          </div>
          {usersLoading && <p>Loading users...</p>}
          {usersError && (
            <p className="text-red-500">
              Error loading users: {usersError.message}
            </p>
          )}
          {usersData && usersData.getUsers.length > 0 ? (
            <div className="w-full overflow-x-auto shadow-md rounded-lg">
              <table className="w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="bg-blue-600 dark:bg-blue-700 text-white">
                  <tr>
                    <th
                      scope="col"
                      className="px-8 py-4 text-left text-xs font-medium uppercase tracking-wider"
                    >
                      Name
                    </th>
                    <th
                      scope="col"
                      className="px-8 py-4 text-left text-xs font-medium uppercase tracking-wider"
                    >
                      Email
                    </th>
                    <th
                      scope="col"
                      className="px-8 py-4 text-left text-xs font-medium uppercase tracking-wider"
                    >
                      Role
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200 dark:bg-gray-800 dark:divide-gray-700">
                  {usersData.getUsers.map((user) => (
                    <tr
                      key={user.id}
                      className="hover:bg-gray-50 dark:hover:bg-gray-700"
                    >
                      <td className="px-8 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                        {user.name}
                      </td>
                      <td className="px-8 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                        {user.email}
                      </td>
                      <td className="px-8 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                        {user.role}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            !usersLoading && !usersError && <p>No users found.</p>
          )}
        </Card>

        <Card className="stat-card mt-6">
          <div className="stat-header">
            <h3 className="stat-title">System Logs</h3>
          </div>

          {logsError && (
            <p className="text-red-500">
              Error loading logs: {logsError.message}
            </p>
          )}
          {logs.length > 0 ? (
            <div className="w-full overflow-x-auto shadow-md rounded-lg">
              <table className="w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="bg-blue-600 dark:bg-blue-700 text-white">
                  <tr>
                    <th
                      scope="col"
                      className="px-8 py-4 text-left text-xs font-medium uppercase tracking-wider"
                    >
                      Timestamp
                    </th>
                    <th
                      scope="col"
                      className="px-8 py-4 text-left text-xs font-medium uppercase tracking-wider"
                    >
                      Level
                    </th>
                    <th
                      scope="col"
                      className="px-8 py-4 text-left text-xs font-medium uppercase tracking-wider"
                    >
                      Type
                    </th>
                    <th
                      scope="col"
                      className="px-8 py-4 text-left text-xs font-medium uppercase tracking-wider"
                    >
                      Message
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200 dark:bg-gray-800 dark:divide-gray-700">
                  {logs.map((log) => (
                    <tr
                      key={log.id}
                      className="hover:bg-gray-50 dark:hover:bg-gray-700"
                    >
                      <td className="px-8 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                        {new Date(parseInt(log.timestamp)).toLocaleString()}
                      </td>
                      <td className="px-8 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                        {log.level}
                      </td>
                      <td className="px-8 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                        {log.type}
                      </td>
                      <td className="px-8 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                        {log.message}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            !logsLoading && !logsError && <p>No logs found.</p>
          )}
        </Card>
      </div>
    </div>
  );
}
