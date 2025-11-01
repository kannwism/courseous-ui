"use client";

import { useState, useEffect } from "react";

interface Task {
  task_id: string;
  url: string;
  status: string;
  started_at: string;
  completed_at?: string;
  error?: string;
  results?: any;
}

interface TasksResponse {
  tasks: Record<string, Task>;
  count: number;
}

interface OutputFile {
  name: string;
  size_mb: number;
  modified: number;
}

interface OutputsResponse {
  files: OutputFile[];
  count: number;
  directory: string;
}

type TabType = "tasks" | "outputs";

export default function TasksSidebar() {
  const [activeTab, setActiveTab] = useState<TabType>("tasks");
  const [tasks, setTasks] = useState<Task[]>([]);
  const [outputs, setOutputs] = useState<OutputFile[]>([]);
  const [loading, setLoading] = useState(true);
  const [outputsLoading, setOutputsLoading] = useState(true);
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [isOpen, setIsOpen] = useState(false);

  const fetchTasks = async () => {
    try {
      const response = await fetch("/api/tasks");
      if (response.ok) {
        const data: TasksResponse = await response.json();
        const taskList = Object.entries(data.tasks).map(([id, task]) => ({
          ...task,
          task_id: task.task_id || id, // Ensure task_id is set
        }));
        setTasks(taskList);
      }
    } catch (error) {
      console.error("Error fetching tasks:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchOutputs = async () => {
    try {
      const response = await fetch("/api/outputs");
      if (response.ok) {
        const data: OutputsResponse = await response.json();
        setOutputs(data.files);
      }
    } catch (error) {
      console.error("Error fetching outputs:", error);
    } finally {
      setOutputsLoading(false);
    }
  };

  const fetchTaskDetails = async (taskId: string) => {
    try {
      const response = await fetch(`/api/tasks/${taskId}`);
      if (response.ok) {
        const data = await response.json();
        setSelectedTask(data);
      }
    } catch (error) {
      console.error("Error fetching task details:", error);
    }
  };

  useEffect(() => {
    fetchTasks();
    fetchOutputs();
    const interval = setInterval(() => {
      fetchTasks();
      fetchOutputs();
    }, 5000); // Poll every 5 seconds
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (selectedTaskId) {
      fetchTaskDetails(selectedTaskId);
    }
  }, [selectedTaskId]);

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "completed":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200";
      case "processing":
      case "in_progress":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200";
      case "failed":
      case "error":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200";
    }
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp * 1000).toLocaleString();
  };

  return (
    <>
      {/* Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed right-6 top-6 z-40 flex h-12 w-12 items-center justify-center rounded-full bg-black text-white shadow-lg transition-all hover:bg-zinc-800 dark:bg-white dark:text-black dark:hover:bg-zinc-200"
        aria-label="Toggle tasks sidebar"
      >
        <svg
          className="h-6 w-6"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
          />
        </svg>
      </button>

      {/* Sidebar */}
      <div
        className={`fixed right-0 top-0 z-50 h-full w-96 transform bg-white shadow-2xl transition-transform duration-300 dark:bg-zinc-900 ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="flex h-full flex-col">
          {/* Header */}
          <div className="border-b border-zinc-200 dark:border-zinc-800">
            <div className="flex items-center justify-between p-6 pb-4">
              <h2 className="text-xl font-bold text-black dark:text-white">
                Explorer Dashboard
              </h2>
              <button
                onClick={() => setIsOpen(false)}
                className="rounded-lg p-2 hover:bg-zinc-100 dark:hover:bg-zinc-800"
                aria-label="Close sidebar"
              >
                <svg
                  className="h-5 w-5 text-zinc-600 dark:text-zinc-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>

            {/* Tabs */}
            <div className="flex gap-1 px-6">
              <button
                onClick={() => setActiveTab("tasks")}
                className={`flex-1 border-b-2 px-4 py-2 text-sm font-medium transition-colors ${
                  activeTab === "tasks"
                    ? "border-black text-black dark:border-white dark:text-white"
                    : "border-transparent text-zinc-500 hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-200"
                }`}
              >
                Tasks ({tasks.length})
              </button>
              <button
                onClick={() => setActiveTab("outputs")}
                className={`flex-1 border-b-2 px-4 py-2 text-sm font-medium transition-colors ${
                  activeTab === "outputs"
                    ? "border-black text-black dark:border-white dark:text-white"
                    : "border-transparent text-zinc-500 hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-200"
                }`}
              >
                Outputs ({outputs.length})
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-6">
            {activeTab === "tasks" ? (
              // Tasks View
              <>
                {loading ? (
                  <div className="flex items-center justify-center py-8">
                    <svg
                      className="h-8 w-8 animate-spin text-zinc-600 dark:text-zinc-400"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      />
                    </svg>
                  </div>
                ) : tasks.length === 0 ? (
                  <div className="py-8 text-center text-sm text-zinc-500 dark:text-zinc-400">
                    No tasks yet. Start an exploration to see tasks here.
                  </div>
                ) : (
                  <div className="flex flex-col gap-3">
                    {tasks.map((task) => (
                      <button
                        key={task.task_id}
                        onClick={() => setSelectedTaskId(task.task_id)}
                        className={`rounded-lg border p-4 text-left transition-all hover:border-zinc-400 dark:hover:border-zinc-600 ${
                          selectedTaskId === task.task_id
                            ? "border-black bg-zinc-50 dark:border-white dark:bg-zinc-800"
                            : "border-zinc-200 bg-white dark:border-zinc-700 dark:bg-zinc-900"
                        }`}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1 overflow-hidden">
                            <p className="truncate text-sm font-medium text-black dark:text-white">
                              {task.url}
                            </p>
                            <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
                              {new Date(task.started_at).toLocaleString()}
                            </p>
                          </div>
                          <span
                            className={`rounded-full px-2 py-1 text-xs font-medium ${getStatusColor(
                              task.status
                            )}`}
                          >
                            {task.status}
                          </span>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </>
            ) : (
              // Outputs View
              <>
                {outputsLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <svg
                      className="h-8 w-8 animate-spin text-zinc-600 dark:text-zinc-400"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      />
                    </svg>
                  </div>
                ) : outputs.length === 0 ? (
                  <div className="py-8 text-center text-sm text-zinc-500 dark:text-zinc-400">
                    No output files yet. Complete an exploration to see outputs here.
                  </div>
                ) : (
                  <div className="flex flex-col gap-3">
                    {outputs.map((output) => (
                      <div
                        key={output.name}
                        className="rounded-lg border border-zinc-200 bg-white p-4 dark:border-zinc-700 dark:bg-zinc-900"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex-1 overflow-hidden">
                            <div className="flex items-center gap-2">
                              <svg
                                className="h-5 w-5 flex-shrink-0 text-zinc-500 dark:text-zinc-400"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                                />
                              </svg>
                              <p className="truncate text-sm font-medium text-black dark:text-white">
                                {output.name}
                              </p>
                            </div>
                            <div className="mt-2 flex items-center gap-3 text-xs text-zinc-500 dark:text-zinc-400">
                              <span>{output.size_mb} MB</span>
                              <span>•</span>
                              <span>{formatDate(output.modified)}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </>
            )}
          </div>

          {/* Task Details Panel - Only show on Tasks tab */}
          {activeTab === "tasks" && selectedTask && (
            <div className="border-t border-zinc-200 bg-zinc-50 p-6 dark:border-zinc-800 dark:bg-zinc-800">
              <h3 className="mb-3 text-sm font-semibold text-black dark:text-white">
                Task Details
              </h3>
              <div className="space-y-2 text-xs">
                <div>
                  <span className="font-medium text-zinc-600 dark:text-zinc-400">
                    Status:{" "}
                  </span>
                  <span
                    className={`rounded-full px-2 py-0.5 ${getStatusColor(
                      selectedTask.status
                    )}`}
                  >
                    {selectedTask.status}
                  </span>
                </div>
                <div>
                  <span className="font-medium text-zinc-600 dark:text-zinc-400">
                    URL:{" "}
                  </span>
                  <span className="text-zinc-900 dark:text-zinc-100">
                    {selectedTask.url}
                  </span>
                </div>
                <div>
                  <span className="font-medium text-zinc-600 dark:text-zinc-400">
                    Started:{" "}
                  </span>
                  <span className="text-zinc-900 dark:text-zinc-100">
                    {new Date(selectedTask.started_at).toLocaleString()}
                  </span>
                </div>
                {selectedTask.completed_at && (
                  <div>
                    <span className="font-medium text-zinc-600 dark:text-zinc-400">
                      Completed:{" "}
                    </span>
                    <span className="text-zinc-900 dark:text-zinc-100">
                      {new Date(selectedTask.completed_at).toLocaleString()}
                    </span>
                  </div>
                )}
                {selectedTask.error && (
                  <div>
                    <span className="font-medium text-red-600 dark:text-red-400">
                      Error:{" "}
                    </span>
                    <span className="text-red-900 dark:text-red-100">
                      {selectedTask.error}
                    </span>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/20 backdrop-blur-sm"
          onClick={() => setIsOpen(false)}
        />
      )}
    </>
  );
}
