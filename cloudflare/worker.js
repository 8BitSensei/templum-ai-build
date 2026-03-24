const GITHUB_SITES_URL = 'https://api.github.com/repos/8BitSensei/Templum-Data/contents/data/sites?ref=gh-pages';
const GITHUB_DATES_URL = 'https://raw.githubusercontent.com/8BitSensei/Templum-Data/gh-pages/data/metadata/dates.json';
const ALLOWED_RAW_HOSTS = new Set(['raw.githubusercontent.com']);

function jsonResponse(data, init = {}) {
  return new Response(JSON.stringify(data), {
    ...init,
    headers: {
      'content-type': 'application/json; charset=utf-8',
      'cache-control': 'public, max-age=300',
      ...(init.headers || {}),
    },
  });
}

async function proxyJson(url) {
  const response = await fetch(url, {
    headers: {
      'User-Agent': 'Templum-App',
      'Accept': 'application/vnd.github+json',
    },
  });

  if (!response.ok) {
    return jsonResponse(
      { error: 'Failed to fetch from GitHub' },
      { status: response.status },
    );
  }

  const data = await response.json();
  return jsonResponse(data);
}

async function handleRawProxy(requestUrl) {
  const rawUrl = requestUrl.searchParams.get('url');
  if (!rawUrl) {
    return jsonResponse({ error: 'URL is required' }, { status: 400 });
  }

  let parsedUrl;
  try {
    parsedUrl = new URL(rawUrl);
  } catch {
    return jsonResponse({ error: 'Invalid URL' }, { status: 400 });
  }

  if (!ALLOWED_RAW_HOSTS.has(parsedUrl.hostname)) {
    return jsonResponse({ error: 'URL host is not allowed' }, { status: 400 });
  }

  const response = await fetch(parsedUrl.toString(), {
    headers: {
      'User-Agent': 'Templum-App',
      'Accept': 'application/json',
    },
  });

  if (!response.ok) {
    return jsonResponse({ error: 'Failed to fetch from GitHub' }, { status: response.status });
  }

  const data = await response.json();
  return jsonResponse(data);
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    if (url.pathname === '/api/github/sites') {
      return proxyJson(GITHUB_SITES_URL);
    }

    if (url.pathname === '/api/github/dates') {
      return proxyJson(GITHUB_DATES_URL);
    }

    if (url.pathname === '/api/github/raw') {
      return handleRawProxy(url);
    }

    return env.ASSETS.fetch(request);
  },
};