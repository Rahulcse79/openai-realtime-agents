"use client";

import { useCallback, useState } from "react";
import {
  taskApi,
  type SearchRequest,
  type TaskCreateModel,
  type TaskModel,
} from "../api/task/taskApi";

export function useTasksApi() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [tasks, setTasks] = useState<TaskModel[] | null>(null);

  const wrap = useCallback(async <T>(fn: () => Promise<T>) => {
    setLoading(true);
    setError(null);
    try {
      return await fn();
    } catch (e: any) {
      setError(String(e?.message ?? e));
      throw e;
    } finally {
      setLoading(false);
    }
  }, []);

  const listAll = useCallback(
    () =>
      wrap(async () => {
        const res = await taskApi.listAll();
        setTasks(res.data ?? []);
        return res;
      }),
    [wrap]
  );

  const list = useCallback(
    (search: SearchRequest) => wrap(() => taskApi.list(search)),
    [wrap]
  );

  const create = useCallback(
    (data: TaskCreateModel) => wrap(() => taskApi.create(data)),
    [wrap]
  );

  const update = useCallback(
    (data: TaskCreateModel) => wrap(() => taskApi.update(data)),
    [wrap]
  );

  const remove = useCallback(
    (ids: number[]) => wrap(() => taskApi.delete(ids)),
    [wrap]
  );

  return {
    loading,
    error,
    tasks,
    setTasks,
    listAll,
    list,
    create,
    update,
    remove,
  } as const;
}
