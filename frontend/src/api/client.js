const API_BASE = '';

async function request(url, options = {}) {
  const config = {
    credentials: 'include',
    headers: {
      ...(options.body && !(options.body instanceof FormData)
        ? { 'Content-Type': 'application/json' }
        : {}),
      ...options.headers,
    },
    ...options,
  };

  const response = await fetch(`${API_BASE}${url}`, config);

  if (!response.ok) {
    const error = await response.json().catch(() => ({ detail: 'Request failed' }));
    throw new Error(error.detail || `HTTP ${response.status}`);
  }

  if (response.status === 204) return null;
  return response.json();
}

// Auth
export const authAPI = {
  signup: (data) => request('/auth/signup', { method: 'POST', body: JSON.stringify(data) }),
  login: (data) => request('/auth/login', { method: 'POST', body: JSON.stringify(data) }),
  logout: () => request('/auth/logout', { method: 'POST' }),
  me: () => request('/auth/me'),
};

// Spaces
export const spacesAPI = {
  list: () => request('/spaces'),
  create: (data) => request('/spaces', { method: 'POST', body: JSON.stringify(data) }),
  get: (id) => request(`/spaces/${id}`),
  delete: (id) => request(`/spaces/${id}`, { method: 'DELETE' }),
};

// Documents
export const documentsAPI = {
  list: (spaceId) => request(`/spaces/${spaceId}/documents`),
  upload: (spaceId, file) => {
    const formData = new FormData();
    formData.append('file', file);
    return request(`/spaces/${spaceId}/documents`, { method: 'POST', body: formData });
  },
  delete: (spaceId, docId) => request(`/spaces/${spaceId}/documents/${docId}`, { method: 'DELETE' }),
};

// Chats
export const chatsAPI = {
  list: (spaceId) => request(`/spaces/${spaceId}/chats`),
  create: (spaceId, data = {}) => request(`/spaces/${spaceId}/chats`, { method: 'POST', body: JSON.stringify(data) }),
  get: (spaceId, chatId) => request(`/spaces/${spaceId}/chats/${chatId}`),
  delete: (spaceId, chatId) => request(`/spaces/${spaceId}/chats/${chatId}`, { method: 'DELETE' }),
};

// RAG Query (SSE streaming)
export function streamQuery(spaceId, chatId, question, onToken, onCitations, onDone, onError) {
  const controller = new AbortController();

  fetch(`${API_BASE}/spaces/${spaceId}/chats/${chatId}/query`, {
    method: 'POST',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ question }),
    signal: controller.signal,
  })
    .then(async (response) => {
      if (!response.ok) {
        const err = await response.json().catch(() => ({}));
        throw new Error(err.detail || 'Query failed');
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            try {
              const data = JSON.parse(line.slice(6));
              if (data.type === 'token') {
                onToken(data.content);
              } else if (data.type === 'citations') {
                onCitations(data.content);
              } else if (data.type === 'done') {
                onDone();
              }
            } catch {
              // Skip malformed JSON
            }
          }
        }
      }
    })
    .catch((err) => {
      if (err.name !== 'AbortError') {
        onError(err.message);
      }
    });

  return controller;
}
