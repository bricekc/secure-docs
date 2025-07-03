import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@apollo/client";
import { GET_USERS, GET_LOGS } from "../gql/admin-queries";
import { Card } from "../components/ui/Card";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "../components/ui/Tabs";
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
      console.log("Connecté au serveur socket");
    });

    socket.on("log", (data) => {
      console.log("Données reçues : ", data);
      setLogs((prevlogs) => [data, ...prevlogs]);
    });

    socket.on("disconnect", () => {
      console.log("Déconnecté du serveur socket");
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
          <h1 className="page-title">Tableau de bord administrateur</h1>
          <p className="page-subtitle">
            Gérer les utilisateurs et consulter les logs système
          </p>
        </div>
      </div>

      <Tabs defaultValue="users" className="mt-6">
        <TabsList className="admin-tabs-list">
          <TabsTrigger value="users" className="admin-tab-trigger">
            <svg
              className="tab-icon"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
              />
            </svg>
            <span>Utilisateurs</span>
          </TabsTrigger>
          <TabsTrigger value="logs" className="admin-tab-trigger">
            <svg
              className="tab-icon"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
            <span>Logs système</span>
          </TabsTrigger>
        </TabsList>
        <TabsContent value="users">
          <Card className="stat-card">
            <div className="stat-header">
              <h3 className="stat-title">Utilisateurs</h3>
            </div>
            {usersLoading && <p>Chargement des utilisateurs...</p>}
            {usersError && (
              <p className="text-red-500">
                Erreur lors du chargement des utilisateurs :{" "}
                {usersError.message}
              </p>
            )}
            {usersData && usersData.getUsers.length > 0 ? (
              <div className="admin-table-container">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>Nom</th>
                      <th>Email</th>
                      <th>Rôle</th>
                    </tr>
                  </thead>
                  <tbody>
                    {usersData.getUsers.map((user, index) => (
                      <tr
                        key={user.id}
                        className={index % 2 === 0 ? "even" : "odd"}
                      >
                        <td>
                          <div className="user-name">{user.name}</div>
                        </td>
                        <td>
                          <div className="user-email">{user.email}</div>
                        </td>
                        <td>
                          <span
                            className={`role-badge ${user.role.toLowerCase()}`}
                          >
                            {user.role}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              !usersLoading && !usersError && <p>Aucun utilisateur trouvé.</p>
            )}
          </Card>
        </TabsContent>
        <TabsContent value="logs">
          <Card className="stat-card">
            <div className="stat-header">
              <h3 className="stat-title">Logs système</h3>
            </div>

            {logsError && (
              <p className="text-red-500">
                Erreur lors du chargement des logs : {logsError.message}
              </p>
            )}
            {logs.length > 0 ? (
              <div className="admin-table-container">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>Horodatage</th>
                      <th>Type</th>
                      <th>Message</th>
                    </tr>
                  </thead>
                  <tbody>
                    {logs.map((log, index) => (
                      <tr
                        key={log.id}
                        className={index % 2 === 0 ? "even" : "odd"}
                      >
                        <td>
                          <div className="log-timestamp">
                            {new Date(parseInt(log.timestamp)).toLocaleString()}
                          </div>
                        </td>
                        <td>
                          <span
                            className={`log-type-badge ${log.type.toLowerCase()}`}
                          >
                            {log.type}
                          </span>
                        </td>
                        <td>
                          <div className="log-message">{log.message}</div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              !logsLoading && !logsError && <p>Aucun log trouvé.</p>
            )}
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
