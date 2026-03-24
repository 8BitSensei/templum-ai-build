import { Site } from '../data/sites';

const GITHUB_API_URL = '/api/github/sites';
const DATES_METADATA_URL = '/api/github/dates';
const RAW_CONTENT_PROXY = '/api/github/raw';

const UNKNOWN_START_YEAR = -1000000;
const UNKNOWN_END_YEAR = 1000000;

export async function fetchSites(): Promise<Site[]> {
  try {
    // Fetch date mapping first
    const datesResponse = await fetch(DATES_METADATA_URL);
    const rawMapping = datesResponse.ok ? await datesResponse.json() : {};
    
    // Normalize mapping keys to lowercase for case-insensitive lookup
    const dateMapping: Record<string, string> = {};
    Object.keys(rawMapping).forEach(key => {
      dateMapping[key.toLowerCase().trim()] = rawMapping[key];
    });

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
      if (!site.isStartYearUnknown) minStart = Math.min(minStart, site.startYear);
      if (!site.isEndYearUnknown) maxEnd = Math.max(maxEnd, site.endYear);
    });

    // Fallbacks if no dates are known
    if (minStart === Infinity) minStart = -150;
    if (maxEnd === -Infinity) maxEnd = 600;

    return validSites.map(site => ({
      ...site,
      startYear: site.isStartYearUnknown ? minStart : site.startYear,
      endYear: site.isEndYearUnknown ? maxEnd : site.endYear
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
  if (!dateStr) return { year: isStart ? UNKNOWN_START_YEAR : UNKNOWN_END_YEAR, unknown: true };
  
  // Normalize: lowercase, trim, remove dots
  const str = dateStr.toLowerCase().trim().replace(/\./g, '');
  
  if (!str || str === 'unknown' || str === 'n/a' || str === 'not available' || str === 'none') {
    return { year: isStart ? UNKNOWN_START_YEAR : UNKNOWN_END_YEAR, unknown: true };
  }

  // Check mapping first (case-insensitive lookup)
  if (mapping[str]) {
    return { year: parseInt(mapping[str]), unknown: false };
  }

  // Handle simple numbers
  if (/^-?\d+$/.test(str)) {
    return { year: parseInt(str), unknown: false };
  }

  // Handle BCE
  if (str.includes('bce') || str.includes('bc')) {
    const match = str.match(/(\d+)/);
    return { year: match ? -parseInt(match[1]) : 0, unknown: false };
  }

  // Handle CE / AD / Century
  const isCentury = str.includes('th') || str.includes('st') || str.includes('nd') || str.includes('rd') || str.includes('century') || str.includes('cent');
  const match = str.match(/(\d+)/);
  
  if (match) {
    const val = parseInt(match[1]);
    
    if (isCentury && val < 100) {
      // Century logic
      let year = (val - 1) * 100;
      
      // Handle post/pre with century
      if (str.startsWith('post')) {
        return { year: val * 100, unknown: false };
      }
      if (str.startsWith('pre')) {
        return { year: (val - 1) * 100, unknown: false };
      }

      if (str.includes('late')) year += 75;
      else if (str.includes('mid')) year += 50;
      else if (str.includes('early')) year += 25;
      return { year, unknown: false };
    }
    
    // Handle post/pre with year
    if (str.startsWith('post')) return { year: val, unknown: false };
    if (str.startsWith('pre')) return { year: val - 1, unknown: false };

    return { year: val, unknown: false };
  }

  return { year: isStart ? UNKNOWN_START_YEAR : UNKNOWN_END_YEAR, unknown: true };
}
