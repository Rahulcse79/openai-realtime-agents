import { loadServerEnvAsync } from "@/app/lib/envSetup";

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

async function getBackendBaseUrl(): Promise<string> {
  await loadServerEnvAsync();
  const base =
    process.env.TASK_BACKEND_BASE_URL ??
    process.env.NEXT_PUBLIC_TASK_BACKEND_BASE_URL;
  if (!base) {
    throw new Error(
      "TASK_BACKEND_BASE_URL not defined (set TASK_BACKEND_BASE_URL or NEXT_PUBLIC_TASK_BACKEND_BASE_URL in .env)"
    );
  }
  return base;
}

function getAuthHeader(): HeadersInit {
  const token =
    process.env.TASK_AUTH_TOKEN ?? process.env.NEXT_PUBLIC_TASK_AUTH_TOKEN;
  if (!token) {
    throw new Error(
      "TASK_AUTH_TOKEN not defined (set TASK_AUTH_TOKEN or NEXT_PUBLIC_TASK_AUTH_TOKEN in .env)"
    );
  }
  return {
    Authorization: token,
  };
}

async function apiFetch<T>(
  path: string,
  init: RequestInit & { json?: unknown } = {}
): Promise<T> {
  await loadServerEnvAsync();

  const headers = new Headers(init.headers);
  Object.entries(getAuthHeader()).forEach(([k, v]) => headers.set(k, v));

  let body = init.body;
  if (init.json !== undefined) {
    headers.set("Content-Type", "application/json");
    body = JSON.stringify(init.json);
  }

  const res = await fetch(path, {
    ...init,
    headers,
    body,
    cache: "no-store",
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(
      `Task API ${res.status} ${res.statusText}${text ? `: ${text}` : ""}`
    );
  }

  const ct = res.headers.get("content-type") ?? "";
  if (ct.includes("application/json")) {
    return (await res.json()) as T;
  }

  return (await res.text()) as unknown as T;
}

export const taskApi = {
  listAll: async () =>
    apiFetch<RequestResponse<TaskModel[]>>(
      `${await getBackendBaseUrl()}/task/listAll`,
      { method: "POST" }
    ),

  list: async (search: SearchRequest) =>
    apiFetch<RequestResponse<any>>(`${await getBackendBaseUrl()}/task/list`, {
      method: "POST",
      json: search,
    }),

  create: async (data: TaskCreateModel) =>
    apiFetch<RequestResponse>(`${await getBackendBaseUrl()}/task/create`, {
      method: "POST",
      json: data,
    }),

  update: async (data: TaskCreateModel) =>
    apiFetch<RequestResponse>(`${await getBackendBaseUrl()}/task/update`, {
      method: "POST",
      json: data,
    }),

  delete: async (ids: number[]) =>
    apiFetch<RequestResponse>(`${await getBackendBaseUrl()}/task/delete`, {
      method: "POST",
      json: { intId: ids } satisfies InputIdModel,
    }),

  listWithStatus: async (status: string, search: SearchRequest) =>
    apiFetch<RequestResponse<any>>(
      `${await getBackendBaseUrl()}/task/listWithStatus/${encodeURIComponent(
        status
      )}`,
      { method: "POST", json: search }
    ),

  getById: async (id: number) =>
    apiFetch<RequestResponse<TaskModel[]>>(
      `${await getBackendBaseUrl()}/task/listAll/${id}`,
      { method: "POST" }
    ),

  userGroupOwner: async (username: string) =>
    apiFetch<RequestResponse<{ reviewer?: string }>>(
      `${await getBackendBaseUrl()}/task/userGroup/${encodeURIComponent(username)}`,
      { method: "POST" }
    ),

  downloadCSV: async (search: SearchRequest): Promise<Blob> => {
    await loadServerEnvAsync();

    const headers = new Headers(getAuthHeader());
    headers.set("Content-Type", "application/json");

    const res = await fetch(`${await getBackendBaseUrl()}/task/downloadCSV`, {
      method: "POST",
      headers,
      body: JSON.stringify(search),
    });

    if (!res.ok) {
      throw new Error(`CSV download failed: ${res.status}`);
    }

    return res.blob();
  },

  uploadFile: async (file: File): Promise<RequestResponse> => {
    await loadServerEnvAsync();

    const form = new FormData();
    form.append("file", file);

    const headers = new Headers(getAuthHeader());

    const res = await fetch(`${await getBackendBaseUrl()}/task/uploadFile`, {
      method: "POST",
      headers,
      body: form,
    });

    if (!res.ok) {
      throw new Error(`Upload failed: ${res.status}`);
    }

    return res.json();
  },

  playUrl: async (id: number) => `${await getBackendBaseUrl()}/task/play/${id}`,

  downloadUrl: async (id: number) =>
    `${await getBackendBaseUrl()}/task/download/${id}`,
} as const;
