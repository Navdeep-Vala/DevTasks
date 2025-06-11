type Task = {
  id: number;
  title: string;
  project: string;
  status: "Pending" | "In Progress" | "Completed";
  dueDate: string;
};

const tasks: Task[] = [
  {
    id: 1,
    title: "Implement login page",
    project: "DevTasks",
    status: "In Progress",
    dueDate: "2025-06-14",
  },
  {
    id: 2,
    title: "Fix dashboard layout",
    project: "DevTasks",
    status: "Pending",
    dueDate: "2025-06-13",
  },
  {
    id: 3,
    title: "Create API integration",
    project: "DevTasks",
    status: "Completed",
    dueDate: "2025-06-10",
  },
];

const statusColor = {
  Pending: "bg-yellow-100 text-yellow-800",
  "In Progress": "bg-blue-100 text-blue-800",
  Completed: "bg-green-100 text-green-800",
};

export default function TaskList() {
  return (
    <div className="bg-white dark:bg-gray-800 shadow-md rounded-xl p-4">
      <h2 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">Today's Tasks</h2>
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left">
          <thead>
            <tr className="text-gray-600 dark:text-gray-300">
              <th className="px-4 py-2">Title</th>
              <th className="px-4 py-2">Project</th>
              <th className="px-4 py-2">Status</th>
              <th className="px-4 py-2">Due Date</th>
            </tr>
          </thead>
          <tbody>
            {tasks.map((task) => (
              <tr key={task.id} className="border-t border-gray-200 dark:border-gray-700">
                <td className="px-4 py-2 text-gray-900 dark:text-white">{task.title}</td>
                <td className="px-4 py-2 text-gray-500 dark:text-gray-300">{task.project}</td>
                <td className="px-4 py-2">
                  <span
                    className={`px-2 py-1 text-xs font-medium rounded-full ${statusColor[task.status]}`}
                  >
                    {task.status}
                  </span>
                </td>
                <td className="px-4 py-2 text-gray-500 dark:text-gray-300">{task.dueDate}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
