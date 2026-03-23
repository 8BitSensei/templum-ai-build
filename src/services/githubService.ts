import { Site } from '../data/sites';

const GITHUB_API_URL = '/api/github/sites';
const DATES_METADATA_URL = '/api/github/dates';
const RAW_CONTENT_PROXY = '/api/github/raw';

export async function fetchSites(): Promise<Site[]> {
  try {
    // Fetch date mapping first
    const datesResponse = await fetch(DATES_METADATA_URL);
    const dateMapping = datesResponse.ok ? await datesResponse.json() : {};

    const response = await fetch(GITHUB_API_URL);
    if (!response.ok) {
      throw new Error('Failed to fetch site list from GitHub');
    }
    const files = await response.json();
    const jsonFiles = files.filter((file: any) => file.name.endsWith('.json'));

    const sitePromises = jsonFiles.map(async (file: any) => {
      // Use proxy for raw content
      const siteResponse = await fetch(`${RAW_CONTENT_PROXY}?url=${encodeURIComponent(file.download_url)}`);
      if (!siteResponse.ok) {
        return null;
      }
      const rawData = await siteResponse.json();
      return mapGitHubDataToSite(rawData, file.sha, dateMapping);
    });

    const sites = await Promise.all(sitePromises);
    const validSites = sites.filter((site): site is Site => site !== null);

    // Handle "unknown" dates logic:
    // "unknown start date as the maximum earliest date"
    // "unknown end date as the maximum end date"
    let minStart = Infinity;
    let maxEnd = -Infinity;

    validSites.forEach(site => {
      if (site.startYear !== 999999) minStart = Math.min(minStart, site.startYear);
      if (site.endYear !== -999999) maxEnd = Math.max(maxEnd, site.endYear);
    });

    // Fallbacks if no dates are known
    if (minStart === Infinity) minStart = -1000;
    if (maxEnd === -Infinity) maxEnd = 2000;

    return validSites.map(site => ({
      ...site,
      startYear: site.startYear === 999999 ? minStart : site.startYear,
      endYear: site.endYear === -999999 ? maxEnd : site.endYear
    }));
  } catch (error) {
    console.error('Error fetching sites:', error);
    throw error;
  }
}

function mapGitHubDataToSite(data: any, id: string, dateMapping: Record<string, string>): Site {
  const startResult = parseDate(data.start, dateMapping, true);
  const endResult = parseDate(data.end, dateMapping, false);

  return {
    id: id.substring(0, 8), // Use a portion of SHA as ID
    name: data.site || 'Unknown Site',
    location: data.location || 'Unknown Location',
    period: `${data.start} – ${data.end}`,
    startYear: startResult.year,
    endYear: endResult.year,
    isStartYearUnknown: startResult.unknown,
    isEndYearUnknown: endResult.unknown,
    description: data.description || '',
    tags: data.tags ? Array.from(new Set(data.tags.split(',').map((t: string) => t.trim()).filter(Boolean))) : [],
    certainty: mapStatusToCertainty(data.status),
    lat: parseFloat(data.latitude) || 0,
    lng: parseFloat(data.longitude) || 0,
    bibliography: Array.isArray(data.bibliography) ? data.bibliography : []
  };
}

function mapStatusToCertainty(status: string): Site['certainty'] {
  const s = status?.toLowerCase();
  if (s === 'certain') return 'Certain';
  if (s === 'probable') return 'Probable';
  if (s === 'possible') return 'Possible';
  if (s === 'unlikely') return 'Unlikely';
  return 'Possible';
}

function parseDate(dateStr: string, mapping: Record<string, string>, isStart: boolean): { year: number, unknown: boolean } {
  const normalizedStr = dateStr?.toLowerCase().trim();
  if (!normalizedStr || normalizedStr === 'unknown' || normalizedStr === 'n/a' || normalizedStr === 'not available' || normalizedStr === 'none') {
    return { year: isStart ? -1000000 : 1000000, unknown: true };
  }
  
  const str = normalizedStr;

  // Check mapping first
  if (mapping[str]) {
    return { year: parseInt(mapping[str]), unknown: false };
  }

  // Handle simple numbers
  if (/^-?\d+$/.test(str)) {
    return { year: parseInt(str), unknown: false };
  }

  // Handle BCE
  if (str.includes('bce')) {
    const match = str.match(/(\d+)/);
    return { year: match ? -parseInt(match[1]) : 0, unknown: false };
  }

  // Handle CE
  if (str.includes('ce')) {
    const match = str.match(/(\d+)/);
    if (match) {
      const val = parseInt(match[1]);
      if (str.includes('th')) {
        // Century
        let year = (val - 1) * 100;
        if (str.includes('late')) year += 75;
        else if (str.includes('mid')) year += 50;
        else if (str.includes('early')) year += 25;
        return { year, unknown: false };
      }
      return { year: val, unknown: false };
    }
  }

  // Handle "post" or "pre"
  if (str.startsWith('post')) {
    const match = str.match(/(\d+)/);
    return { year: match ? parseInt(match[1]) : 0, unknown: false };
  }
  if (str.startsWith('pre')) {
    const match = str.match(/(\d+)/);
    return { year: match ? parseInt(match[1]) - 100 : 0, unknown: false };
  }

  return { year: isStart ? -1000000 : 1000000, unknown: true };
}
