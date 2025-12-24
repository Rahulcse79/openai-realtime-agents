export type RequestResponse<T = unknown> = {
  status?: string;
  message?: string;
  messageDetail?: string;
  data?: T;
};

export type SearchRequest = {
  currentPage: number;
  pageSize: number;
  sortBy?: string | null;
  sortDirection?: "asc" | "desc" | string;
  columnNames?: string[];
  [k: string]: any;
};

export type InputIdModel = {
  intId: number[];
};

export type TaskCreateModel = {
  id?: number;
  tasksName?: string;
  taskDescription?: string;
  taskType?: string;
  taskPriority?: string;
  assignedTo?: number;
  expectedCompletionDate?: string;
  assignedGroup?: string;
  assignedUser?: string;
  assignedOn?: string;
  reviewer?: string;
  currentStats?: string;
  isTaskCompleted?: boolean;
  taskCompletedOn?: string;
  createdBy?: string;
  createdOn?: string;
  updatedBy?: string;
  updatedOn?: string;
  changedCompletionOn?: string;
  isDelay?: boolean;
  remarks?: string;
  filePath?: string;
  dueDate?: string;
};

export type TaskModel = TaskCreateModel & {
  assignedUserDesignation?: string;
  reviewerDesignation?: string;
  createdByDesignation?: string;
  updatedByDesignation?: string;
  isDelayState?: boolean;
  taskClosedBy?: string;
};

function getAuthHeader() {
  const token = process.env.TASK_AUTH_TOKEN;
  if (!token)
    throw new Error("TASK_AUTH_TOKEN not defined in environment variables");
  return {
    Authorization: token.startsWith("Bearer ") ? token : `Bearer ${token}`,
  };
}

async function apiFetch<T>(
  path: string,
  init: RequestInit & { json?: any } = {}
): Promise<T> {
  const headers = new Headers(init.headers);
  Object.entries(getAuthHeader()).forEach(([k, v]) => headers.set(k, v));

  let body = init.body;
  if (init.json !== undefined) {
    headers.set("Content-Type", "application/json");
    body = JSON.stringify(init.json);
  }

  const res = await fetch(path, { ...init, headers, body, cache: "no-store" });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(
      `Task API ${res.status} ${res.statusText}${text ? `: ${text}` : ""}`
    );
  }

  const ct = res.headers.get("content-type") ?? "";
  if (ct.includes("application/json")) return (await res.json()) as T;

  return (await res.text()) as unknown as T;
}

const BASE = process.env.TASK_BACKEND_BASE_URL ?? "http://localhost";

export const taskApi = {
  listAll: () =>
    apiFetch<RequestResponse<TaskModel[]>>(`${BASE}/task/listAll`, {
      method: "POST",
    }),

  list: (search: SearchRequest) =>
    apiFetch<RequestResponse<any>>(`${BASE}/task/list`, {
      method: "POST",
      json: search,
    }),

  create: (data: TaskCreateModel) =>
    apiFetch<RequestResponse>(`${BASE}/task/create`, {
      method: "POST",
      json: data,
    }),

  update: (data: TaskCreateModel) =>
    apiFetch<RequestResponse>(`${BASE}/task/update`, {
      method: "POST",
      json: data,
    }),

  delete: (ids: number[]) =>
    apiFetch<RequestResponse>(`${BASE}/task/delete`, {
      method: "POST",
      json: { intId: ids } satisfies InputIdModel,
    }),

  listWithStatus: (status: string, search: SearchRequest) =>
    apiFetch<RequestResponse<any>>(
      `${BASE}/task/listWithStatus/${encodeURIComponent(status)}`,
      { method: "POST", json: search }
    ),

  getById: (id: number) =>
    apiFetch<RequestResponse<TaskModel[]>>(`${BASE}/task/listAll/${id}`, {
      method: "POST",
    }),

  userGroupOwner: (username: string) =>
    apiFetch<RequestResponse<{ reviewer?: string }>>(
      `${BASE}/task/userGroup/${encodeURIComponent(username)}`,
      { method: "POST" }
    ),

  downloadCSV: async (search: SearchRequest): Promise<Blob> => {
    const headers = new Headers(getAuthHeader());
    headers.set("Content-Type", "application/json");
    const res = await fetch(`${BASE}/task/downloadCSV`, {
      method: "POST",
      headers,
      body: JSON.stringify(search),
    });
    if (!res.ok) throw new Error(`CSV download failed: ${res.status}`);
    return res.blob();
  },

  uploadFile: async (file: File): Promise<RequestResponse> => {
    const form = new FormData();
    form.append("file", file);
    const headers = new Headers(getAuthHeader());
    const res = await fetch(`${BASE}/task/uploadFile`, {
      method: "POST",
      headers,
      body: form,
    });
    if (!res.ok) throw new Error(`Upload failed: ${res.status}`);
    return res.json() as Promise<RequestResponse>;
  },

  playUrl: (id: number) => `${BASE}/task/play/${id}`,
  downloadUrl: (id: number) => `${BASE}/task/download/${id}`,
} as const;
