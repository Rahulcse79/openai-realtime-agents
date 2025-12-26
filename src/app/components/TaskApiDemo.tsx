'use client';

import { useEffect, useMemo, useState } from 'react';
import { useTasksApi } from '../hooks/useTasksApi';
import type { TaskCreateModel, TaskModel } from '../api/task/taskApi';

export default function TaskApiDemo() {
  const { loading, error, tasks, setTasks, listAll, create, update, remove } = useTasksApi();

  const [statusFilter, setStatusFilter] = useState<string>('');
  const [isCreateOpen, setIsCreateOpen] = useState<boolean>(false);

  const [form, setForm] = useState<TaskCreateModel>({
    tasksName: 'Test Task from UI',
    taskDescription: 'Created via Next.js UI',
    taskType: 'General',
    taskPriority: 'Normal',
    currentStats: 'New',
  });

  const canSubmit = useMemo(() => Boolean(form.tasksName && form.currentStats), [form]);

  const refresh = async () => {
    if (statusFilter.trim()) {
      const { taskApi } = await import('../api/task/taskApi');
      const filtered = await taskApi.listWithStatus(statusFilter, {
        currentPage: 0,
        pageSize: 25,
        sortDirection: 'desc',
      } as any);

      const data = (filtered as any)?.data?.currentPageData ?? (filtered as any)?.data ?? [];
      setTasks(Array.isArray(data) ? (data as TaskModel[]) : []);
      return;
    }
    await listAll();
  };

  useEffect(() => {
    // Load once on mount
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

  const statusOptions = ['New', 'In progress', 'Urgent', 'Closed', 'Completed', 'Pending for approval'];

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'new': return { bg: 'rgba(0, 168, 255, 0.15)', border: 'rgba(0, 168, 255, 0.4)', text: '#00a8ff' };
      case 'in progress': return { bg: 'rgba(255, 153, 51, 0.15)', border: 'rgba(255, 153, 51, 0.4)', text: '#ff9933' };
      case 'urgent': return { bg: 'rgba(255, 46, 99, 0.15)', border: 'rgba(255, 46, 99, 0.4)', text: '#ff2e63' };
      case 'closed': return { bg: 'rgba(100, 100, 100, 0.15)', border: 'rgba(100, 100, 100, 0.4)', text: '#888' };
      case 'completed': return { bg: 'rgba(0, 255, 136, 0.15)', border: 'rgba(0, 255, 136, 0.4)', text: '#00ff88' };
      case 'pending for approval': return { bg: 'rgba(255, 215, 0, 0.15)', border: 'rgba(255, 215, 0, 0.4)', text: '#ffd700' };
      default: return { bg: 'rgba(0, 245, 255, 0.1)', border: 'rgba(0, 245, 255, 0.3)', text: '#00f5ff' };
    }
  };

  return (
    <div className="rounded-xl overflow-hidden"
      style={{
        background: 'linear-gradient(180deg, rgba(10, 14, 26, 0.98) 0%, rgba(13, 27, 42, 0.95) 100%)',
      }}>
      {/* Header */}
      <div className="flex items-start justify-between gap-3 p-4"
        style={{
          background: 'linear-gradient(90deg, rgba(255, 153, 51, 0.08), rgba(0, 245, 255, 0.05))',
          borderBottom: '1px solid rgba(255, 153, 51, 0.2)'
        }}>
        <div className="flex items-center gap-2">
          <button
            className="rounded-lg px-3 py-1.5 text-xs font-bold tracking-wider font-mono transition-all duration-200 hover:scale-105 disabled:opacity-50"
            style={{
              background: isCreateOpen 
                ? 'linear-gradient(135deg, rgba(255, 46, 99, 0.2), rgba(255, 0, 60, 0.1))'
                : 'linear-gradient(135deg, rgba(0, 255, 136, 0.2), rgba(0, 200, 100, 0.1))',
              border: isCreateOpen 
                ? '1px solid rgba(255, 46, 99, 0.4)'
                : '1px solid rgba(0, 255, 136, 0.4)',
              color: isCreateOpen ? '#ff2e63' : '#00ff88',
              boxShadow: isCreateOpen 
                ? '0 0 15px rgba(255, 46, 99, 0.2)'
                : '0 0 15px rgba(0, 255, 136, 0.2)'
            }}
            onClick={() => setIsCreateOpen((s) => !s)}
            disabled={loading}
          >
            {isCreateOpen ? '✕ CLOSE' : '+ NEW'}
          </button>
          <button
            className="rounded-lg px-3 py-1.5 text-xs font-bold tracking-wider font-mono transition-all duration-200 hover:scale-105 disabled:opacity-50"
            style={{
              background: 'linear-gradient(135deg, rgba(0, 168, 255, 0.2), rgba(0, 120, 200, 0.1))',
              border: '1px solid rgba(0, 168, 255, 0.4)',
              color: '#00a8ff',
              boxShadow: '0 0 15px rgba(0, 168, 255, 0.2)'
            }}
            onClick={() => refresh()}
            disabled={loading}
          >
            ⟳ REFRESH
          </button>
        </div>
      </div>

      <div className="p-4">
        {/* Status Filter */}
        <div className="mb-4 p-3 rounded-lg"
          style={{
            background: 'rgba(0, 168, 255, 0.05)',
            border: '1px solid rgba(0, 168, 255, 0.15)'
          }}>
          <label className="text-[10px] font-bold tracking-wider font-mono mb-2 block" style={{ color: '#00a8ff' }}>
            STATUS FILTER
          </label>
          <div className="flex items-center gap-2">
            <select
              className="flex-1 rounded-lg px-3 py-2 text-sm font-mono focus:outline-none"
              style={{
                background: 'rgba(26, 39, 68, 0.8)',
                border: '1px solid rgba(0, 245, 255, 0.2)',
                color: '#e0f7ff'
              }}
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
              className="shrink-0 rounded-lg px-4 py-2 text-xs font-bold tracking-wider font-mono transition-all duration-200 hover:scale-105 disabled:opacity-50"
              style={{
                background: 'linear-gradient(135deg, rgba(0, 245, 255, 0.2), rgba(0, 168, 255, 0.1))',
                border: '1px solid rgba(0, 245, 255, 0.4)',
                color: '#00f5ff'
              }}
              onClick={() => refresh()}
              disabled={loading}
            >
              APPLY
            </button>
          </div>
        </div>

        {/* Create Form */}
        {isCreateOpen ? (
          <div className="mb-4 rounded-lg p-4"
            style={{
              background: 'linear-gradient(135deg, rgba(0, 255, 136, 0.05), rgba(0, 200, 100, 0.02))',
              border: '1px solid rgba(0, 255, 136, 0.2)'
            }}>
            <div className="text-sm font-bold tracking-wider font-mono mb-3" style={{ color: '#00ff88' }}>
              CREATE NEW MISSION
            </div>
            <div className="grid grid-cols-1 gap-3">
              <label className="flex flex-col gap-1">
                <span className="text-[10px] font-bold tracking-wider font-mono" style={{ color: 'rgba(0, 245, 255, 0.7)' }}>TASK NAME</span>
                <input
                  className="rounded-lg px-3 py-2 text-sm font-mono focus:outline-none"
                  style={{
                    background: 'rgba(26, 39, 68, 0.8)',
                    border: '1px solid rgba(0, 245, 255, 0.2)',
                    color: '#e0f7ff'
                  }}
                  value={form.tasksName ?? ''}
                  onChange={(e) => setForm((p) => ({ ...p, tasksName: e.target.value }))}
                />
              </label>
              <label className="flex flex-col gap-1">
                <span className="text-[10px] font-bold tracking-wider font-mono" style={{ color: 'rgba(0, 245, 255, 0.7)' }}>PRIORITY</span>
                <input
                  className="rounded-lg px-3 py-2 text-sm font-mono focus:outline-none"
                  style={{
                    background: 'rgba(26, 39, 68, 0.8)',
                    border: '1px solid rgba(0, 245, 255, 0.2)',
                    color: '#e0f7ff'
                  }}
                  value={form.taskPriority ?? ''}
                  onChange={(e) => setForm((p) => ({ ...p, taskPriority: e.target.value }))}
                />
              </label>
              <label className="flex flex-col gap-1">
                <span className="text-[10px] font-bold tracking-wider font-mono" style={{ color: 'rgba(0, 245, 255, 0.7)' }}>STATUS</span>
                <select
                  className="rounded-lg px-3 py-2 text-sm font-mono focus:outline-none"
                  style={{
                    background: 'rgba(26, 39, 68, 0.8)',
                    border: '1px solid rgba(0, 245, 255, 0.2)',
                    color: '#e0f7ff'
                  }}
                  value={form.currentStats ?? ''}
                  onChange={(e) => setForm((p) => ({ ...p, currentStats: e.target.value }))}
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
                <span className="text-[10px] font-bold tracking-wider font-mono" style={{ color: 'rgba(0, 245, 255, 0.7)' }}>DESCRIPTION</span>
                <input
                  className="rounded-lg px-3 py-2 text-sm font-mono focus:outline-none"
                  style={{
                    background: 'rgba(26, 39, 68, 0.8)',
                    border: '1px solid rgba(0, 245, 255, 0.2)',
                    color: '#e0f7ff'
                  }}
                  value={form.taskDescription ?? ''}
                  onChange={(e) => setForm((p) => ({ ...p, taskDescription: e.target.value }))}
                />
              </label>
              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  className="rounded-lg px-4 py-2 text-xs font-bold tracking-wider font-mono transition-all duration-200 hover:scale-105 disabled:opacity-50"
                  style={{
                    background: 'linear-gradient(135deg, rgba(100, 100, 100, 0.2), rgba(80, 80, 80, 0.1))',
                    border: '1px solid rgba(100, 100, 100, 0.4)',
                    color: '#888'
                  }}
                  onClick={() => setIsCreateOpen(false)}
                  disabled={loading}
                >
                  CANCEL
                </button>
                <button
                  className="rounded-lg px-4 py-2 text-xs font-bold tracking-wider font-mono transition-all duration-200 hover:scale-105 disabled:opacity-50"
                  style={{
                    background: 'linear-gradient(135deg, rgba(0, 255, 136, 0.3), rgba(0, 200, 100, 0.2))',
                    border: '1px solid rgba(0, 255, 136, 0.5)',
                    color: '#00ff88',
                    boxShadow: '0 0 20px rgba(0, 255, 136, 0.3)'
                  }}
                  disabled={!canSubmit || loading}
                  onClick={onCreate}
                >
                  ✓ CREATE
                </button>
              </div>
            </div>
          </div>
        ) : null}

        {/* Error Message */}
        {error ? (
          <div className="mb-3 rounded-lg p-3 text-xs font-mono"
            style={{
              background: 'linear-gradient(135deg, rgba(255, 46, 99, 0.15), rgba(255, 0, 60, 0.1))',
              border: '1px solid rgba(255, 46, 99, 0.3)',
              color: '#ff2e63'
            }}>
            ⚠ {error}
          </div>
        ) : null}

        {/* Tasks Table */}
        <div className="rounded-lg overflow-hidden"
          style={{
            border: '1px solid rgba(0, 245, 255, 0.15)'
          }}>
          <div className="max-h-80 overflow-auto">
            <table className="w-full border-collapse text-left text-sm">
              <thead className="sticky top-0"
                style={{
                  background: 'linear-gradient(90deg, rgba(0, 168, 255, 0.15), rgba(0, 245, 255, 0.1))',
                }}>
                <tr>
                  <th className="px-4 py-3 font-bold text-[10px] tracking-wider font-mono" style={{ color: '#00a8ff' }}>TASK</th>
                  <th className="px-4 py-3 font-bold text-[10px] tracking-wider font-mono" style={{ color: '#00a8ff' }}>PRIORITY</th>
                  <th className="px-4 py-3 font-bold text-[10px] tracking-wider font-mono" style={{ color: '#00a8ff' }}>STATUS</th>
                  <th className="px-4 py-3 font-bold text-[10px] tracking-wider font-mono" style={{ color: '#00a8ff' }}>ACTIONS</th>
                </tr>
              </thead>
              <tbody>
                {loading && (!tasks || tasks.length === 0) ? (
                  <tr>
                    <td className="px-4 py-4 text-xs font-mono" style={{ color: 'rgba(0, 245, 255, 0.6)' }} colSpan={4}>
                      <span className="animate-pulse">⟳ Loading missions...</span>
                    </td>
                  </tr>
                ) : null}

                {!loading && (!tasks || tasks.length === 0) ? (
                  <tr>
                    <td className="px-4 py-4 text-xs font-mono" style={{ color: 'rgba(255, 153, 51, 0.6)' }} colSpan={4}>
                      No missions found.
                    </td>
                  </tr>
                ) : null}

                {tasks?.map((t, idx) => {
                  const statusColor = getStatusColor(t.currentStats || '');
                  return (
                    <tr key={String(t.id ?? t.tasksName)} 
                      className="transition-all duration-200 hover:scale-[1.01]"
                      style={{
                        borderTop: '1px solid rgba(0, 245, 255, 0.1)',
                        background: idx % 2 === 0 ? 'rgba(0, 0, 0, 0.2)' : 'transparent'
                      }}>
                      <td className="px-4 py-3">
                        <div className="font-bold text-sm" style={{ color: '#e0f7ff' }}>{t.tasksName ?? '-'}</div>
                        {t.taskDescription ? (
                          <div className="text-[10px] line-clamp-2 mt-0.5" style={{ color: 'rgba(0, 245, 255, 0.5)' }}>{t.taskDescription}</div>
                        ) : null}
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-xs font-mono px-2 py-1 rounded"
                          style={{
                            background: 'rgba(255, 153, 51, 0.15)',
                            border: '1px solid rgba(255, 153, 51, 0.3)',
                            color: '#ff9933'
                          }}>
                          {t.taskPriority ?? '-'}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <select
                          className="rounded-lg px-2 py-1 text-xs font-mono focus:outline-none cursor-pointer"
                          style={{
                            background: statusColor.bg,
                            border: `1px solid ${statusColor.border}`,
                            color: statusColor.text
                          }}
                          value={t.currentStats ?? ''}
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
                      <td className="px-4 py-3">
                        <button
                          className="rounded-lg px-3 py-1.5 text-[10px] font-bold tracking-wider font-mono transition-all duration-200 hover:scale-105 disabled:opacity-50"
                          style={{
                            background: 'linear-gradient(135deg, rgba(255, 46, 99, 0.2), rgba(255, 0, 60, 0.1))',
                            border: '1px solid rgba(255, 46, 99, 0.4)',
                            color: '#ff2e63'
                          }}
                          onClick={() => onDelete(t)}
                          disabled={loading || !t.id}
                        >
                          ✕ DELETE
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
