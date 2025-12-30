"use client";
import { useEffect, useMemo, useState } from "react";
import { useTasksApi } from "../hooks/useTasksApi";
import type { TaskCreateModel, TaskModel } from "../api/task/taskApi";

export default function TaskApiDemo() {
  const { loading, error, tasks, setTasks, listAll, create, update, remove } =
    useTasksApi();

  const [statusFilter, setStatusFilter] = useState<string>("");
  const [isCreateOpen, setIsCreateOpen] = useState<boolean>(false);

  const [form, setForm] = useState<TaskCreateModel>({
    tasksName: "Test Task from UI",
    taskDescription: "Created via Next.js UI",
    taskType: "General",
    taskPriority: "Normal",
    currentStats: "New",
  });

  const canSubmit = useMemo(
    () => Boolean(form.tasksName && form.currentStats),
    [form]
  );

  const refresh = async () => {
    if (statusFilter.trim()) {
      const { taskApi } = await import("../api/task/taskApi");
      const filtered = await taskApi.listWithStatus(statusFilter, {
        currentPage: 0,
        pageSize: 25,
        sortDirection: "desc",
      } as any);

      const data =
        (filtered as any)?.data?.currentPageData ??
        (filtered as any)?.data ??
        [];
      setTasks(Array.isArray(data) ? (data as TaskModel[]) : []);
      return;
    }
    await listAll();
  };

  useEffect(() => {
    refresh().catch(() => {});
  }, []);

  const onCreate = async () => {
    await create(form);
    setIsCreateOpen(false);
    await refresh();
  };

  const quickUpdateStatus = async (t: TaskModel, newStatus: string) => {
    if (!t.id) return;
    await update({ id: t.id, currentStats: newStatus });
    await refresh();
  };

  const onDelete = async (t: TaskModel) => {
    if (!t.id) return;
    await remove([t.id]);
    await refresh();
  };

  const statusOptions = [
    "New",
    "In progress",
    "Urgent",
    "Closed",
    "Completed",
    "Pending for approval",
  ];

  return (
    <div className="rounded-xl border border-gray-200 bg-white shadow-sm">
      <div className="flex items-start justify-between gap-3 border-b border-gray-100 p-4">
        <div>
          <div className="text-sm font-semibold text-gray-900">Tasks</div>
          <div className="text-xs text-gray-500">
            Create, view, and manage tasks
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            className="rounded-md border border-gray-200 bg-white px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
            onClick={() => setIsCreateOpen((s) => !s)}
            disabled={loading}
          >
            {isCreateOpen ? "Close" : "New"}
          </button>
          <button
            className="rounded-md bg-gray-900 px-3 py-1.5 text-xs font-medium text-white hover:bg-black disabled:opacity-50"
            onClick={() => refresh()}
            disabled={loading}
          >
            Refresh
          </button>
        </div>
      </div>

      <div className="p-4">
        <div className="mb-3 flex flex-col gap-2">
          <label className="text-xs font-medium text-gray-600">
            Status filter
          </label>
          <div className="flex items-center gap-2">
            <select
              className="w-full rounded-md border border-gray-200 bg-white px-2 py-2 text-sm"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="">All statuses</option>
              {statusOptions.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
            <button
              className="shrink-0 rounded-md border border-gray-200 bg-white px-3 py-2 text-xs font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
              onClick={() => refresh()}
              disabled={loading}
            >
              Apply
            </button>
          </div>
          <div className="text-[11px] text-gray-500">
            Uses <code>/services/api/v2/task/listWithStatus/{"{status}"}</code>.
          </div>
        </div>

        {isCreateOpen ? (
          <div className="mb-4 rounded-lg border border-gray-200 bg-gray-50 p-3">
            <div className="mb-2 text-sm font-semibold text-gray-900">
              Create task
            </div>
            <div className="grid grid-cols-1 gap-2">
              <label className="flex flex-col gap-1">
                <span className="text-xs font-medium text-gray-600">
                  Task name
                </span>
                <input
                  className="rounded-md border border-gray-200 bg-white px-2 py-2 text-sm"
                  value={form.tasksName ?? ""}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, tasksName: e.target.value }))
                  }
                />
              </label>
              <label className="flex flex-col gap-1">
                <span className="text-xs font-medium text-gray-600">
                  Priority
                </span>
                <input
                  className="rounded-md border border-gray-200 bg-white px-2 py-2 text-sm"
                  value={form.taskPriority ?? ""}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, taskPriority: e.target.value }))
                  }
                />
              </label>
              <label className="flex flex-col gap-1">
                <span className="text-xs font-medium text-gray-600">
                  Status
                </span>
                <select
                  className="rounded-md border border-gray-200 bg-white px-2 py-2 text-sm"
                  value={form.currentStats ?? ""}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, currentStats: e.target.value }))
                  }
                >
                  <option value="">Select status</option>
                  {statusOptions.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </label>
              <label className="flex flex-col gap-1">
                <span className="text-xs font-medium text-gray-600">
                  Description
                </span>
                <input
                  className="rounded-md border border-gray-200 bg-white px-2 py-2 text-sm"
                  value={form.taskDescription ?? ""}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, taskDescription: e.target.value }))
                  }
                />
              </label>
              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  className="rounded-md border border-gray-200 bg-white px-3 py-2 text-xs font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
                  onClick={() => setIsCreateOpen(false)}
                  disabled={loading}
                >
                  Cancel
                </button>
                <button
                  className="rounded-md bg-blue-600 px-3 py-2 text-xs font-medium text-white hover:bg-blue-700 disabled:opacity-50"
                  disabled={!canSubmit || loading}
                  onClick={onCreate}
                >
                  Create
                </button>
              </div>
            </div>
          </div>
        ) : null}

        {error ? (
          <div className="mb-3 rounded-lg border border-red-200 bg-red-50 p-3 text-xs text-red-800">
            {error}
          </div>
        ) : null}

        <div className="rounded-lg border border-gray-200 overflow-hidden">
          <div className="max-h-80 overflow-auto">
            <table className="w-full border-collapse text-left text-sm">
              <thead className="sticky top-0 bg-gray-50 text-xs text-gray-600">
                <tr>
                  <th className="px-3 py-2 font-semibold">Task</th>
                  <th className="px-3 py-2 font-semibold">Priority</th>
                  <th className="px-3 py-2 font-semibold">Status</th>
                  <th className="px-3 py-2 font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody className="text-gray-800">
                {loading && (!tasks || tasks.length === 0) ? (
                  <tr>
                    <td className="px-3 py-3 text-xs text-gray-500" colSpan={4}>
                      Loading…
                    </td>
                  </tr>
                ) : null}

                {!loading && (!tasks || tasks.length === 0) ? (
                  <tr>
                    <td className="px-3 py-3 text-xs text-gray-500" colSpan={4}>
                      No tasks found.
                    </td>
                  </tr>
                ) : null}

                {tasks?.map((t) => (
                  <tr
                    key={String(t.id ?? t.tasksName)}
                    className="border-t border-gray-100"
                  >
                    <td className="px-3 py-2">
                      <div className="font-medium text-gray-900">
                        {t.tasksName ?? "-"}
                      </div>
                      {t.taskDescription ? (
                        <div className="text-xs text-gray-500 line-clamp-2">
                          {t.taskDescription}
                        </div>
                      ) : null}
                    </td>
                    <td className="px-3 py-2 text-xs text-gray-700">
                      {t.taskPriority ?? "-"}
                    </td>
                    <td className="px-3 py-2">
                      <select
                        className="rounded-md border border-gray-200 bg-white px-2 py-1 text-xs"
                        value={t.currentStats ?? ""}
                        onChange={(e) => quickUpdateStatus(t, e.target.value)}
                        disabled={loading || !t.id}
                      >
                        <option value="">-</option>
                        {statusOptions.map((s) => (
                          <option key={s} value={s}>
                            {s}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td className="px-3 py-2">
                      <button
                        className="rounded-md border border-red-200 bg-white px-2 py-1 text-xs font-medium text-red-700 hover:bg-red-50 disabled:opacity-50"
                        onClick={() => onDelete(t)}
                        disabled={loading || !t.id}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
