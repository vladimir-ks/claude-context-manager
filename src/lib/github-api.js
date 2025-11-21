/**
 * GitHub API Integration
 *
 * Handles GitHub issue creation and search for feedback system
 * Uses GitHub REST API v3 (unauthenticated, public repo)
 *
 * Author: Vladimir K.S.
 */

const https = require('https');

const REPO_OWNER = 'vladks';
const REPO_NAME = 'claude-context-manager';
const GITHUB_API_BASE = 'api.github.com';

/**
 * Make HTTPS request to GitHub API
 *
 * @param {string} method - HTTP method (GET, POST)
 * @param {string} path - API path
 * @param {Object} data - Request body (for POST)
 * @returns {Promise<Object>} Response data
 */
function makeRequest(method, path, data = null) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: GITHUB_API_BASE,
      port: 443,
      path: path,
      method: method,
      headers: {
        'User-Agent': 'Claude-Context-Manager',
        Accept: 'application/vnd.github.v3+json'
      }
    };

    if (data) {
      const body = JSON.stringify(data);
      options.headers['Content-Type'] = 'application/json';
      options.headers['Content-Length'] = Buffer.byteLength(body);
    }

    const req = https.request(options, res => {
      let responseBody = '';

      res.on('data', chunk => {
        responseBody += chunk;
      });

      res.on('end', () => {
        try {
          const parsed = JSON.parse(responseBody);

          if (res.statusCode >= 200 && res.statusCode < 300) {
            resolve(parsed);
          } else {
            reject(
              new Error(`GitHub API error: ${res.statusCode} - ${parsed.message || responseBody}`)
            );
          }
        } catch (error) {
          reject(new Error(`Failed to parse GitHub response: ${error.message}`));
        }
      });
    });

    req.on('error', error => {
      reject(new Error(`Network error: ${error.message}`));
    });

    // Add 10 second timeout
    req.setTimeout(10000, () => {
      req.destroy();
      reject(new Error('Request timeout (10s)'));
    });

    if (data) {
      req.write(JSON.stringify(data));
    }

    req.end();
  });
}

/**
 * Search for existing issues matching keywords
 *
 * @param {string} query - Search query
 * @param {Object} options - Search options
 * @returns {Promise<Array>} Matching issues
 */
async function searchIssues(query, options = {}) {
  const { state = 'open', labels = [], limit = 10 } = options;

  // Build search query
  let searchQuery = `${query} repo:${REPO_OWNER}/${REPO_NAME}`;

  if (state) {
    searchQuery += ` state:${state}`;
  }

  labels.forEach(label => {
    searchQuery += ` label:"${label}"`;
  });

  const encodedQuery = encodeURIComponent(searchQuery);
  const path = `/search/issues?q=${encodedQuery}&per_page=${limit}`;

  try {
    const response = await makeRequest('GET', path);
    return response.items || [];
  } catch (error) {
    throw new Error(`Issue search failed: ${error.message}`);
  }
}

/**
 * Create new GitHub issue
 *
 * @param {Object} issue - Issue data
 * @param {string} issue.title - Issue title
 * @param {string} issue.body - Issue body (markdown)
 * @param {Array<string>} issue.labels - Issue labels
 * @returns {Promise<Object>} Created issue
 */
async function createIssue(issue) {
  const { title, body, labels = ['user-feedback', 'needs-triage'] } = issue;

  if (!title || !body) {
    throw new Error('Issue title and body are required');
  }

  const path = `/repos/${REPO_OWNER}/${REPO_NAME}/issues`;

  try {
    const response = await makeRequest('POST', path, {
      title,
      body,
      labels
    });

    return {
      number: response.number,
      url: response.html_url,
      title: response.title,
      state: response.state,
      created_at: response.created_at
    };
  } catch (error) {
    throw new Error(`Issue creation failed: ${error.message}`);
  }
}

/**
 * Extract error codes from text
 *
 * @param {string} text - Text to search
 * @returns {Array<string>} Found error codes
 */
function extractErrorCodes(text) {
  const errorCodePattern = /CCM_ERR_\d{3}/g;
  const matches = text.match(errorCodePattern);
  return matches ? [...new Set(matches)] : [];
}

/**
 * Extract keywords from text
 *
 * @param {string} text - Text to extract from
 * @returns {Array<string>} Normalized keywords
 */
function extractKeywords(text) {
  // Remove error codes first
  let cleaned = text.replace(/CCM_ERR_\d{3}/g, '');

  // Convert to lowercase
  cleaned = cleaned.toLowerCase();

  // Remove common words
  const stopWords = [
    'the',
    'a',
    'an',
    'and',
    'or',
    'but',
    'in',
    'on',
    'at',
    'to',
    'for',
    'of',
    'with',
    'is',
    'was',
    'are',
    'were',
    'been',
    'be',
    'have',
    'has',
    'had',
    'do',
    'does',
    'did'
  ];

  // Extract words (alphanumeric + hyphens)
  const words = cleaned.match(/[\w-]+/g) || [];

  // Filter stop words and short words
  const keywords = words.filter(word => word.length > 2 && !stopWords.includes(word));

  return [...new Set(keywords)]; // Remove duplicates
}

/**
 * Calculate similarity score between two texts
 *
 * @param {string} text1 - First text
 * @param {string} text2 - Second text
 * @returns {number} Similarity score (0-1)
 */
function calculateSimilarity(text1, text2) {
  const keywords1 = new Set(extractKeywords(text1));
  const keywords2 = new Set(extractKeywords(text2));

  // Calculate Jaccard similarity
  const intersection = new Set([...keywords1].filter(k => keywords2.has(k)));
  const union = new Set([...keywords1, ...keywords2]);

  if (union.size === 0) return 0;

  return intersection.size / union.size;
}

/**
 * Check for duplicate issues
 *
 * @param {string} message - Feedback message
 * @param {Object} options - Search options
 * @returns {Promise<Object|null>} Duplicate issue or null
 */
async function findDuplicateIssue(message, options = {}) {
  const { similarityThreshold = 0.75 } = options;

  // Step 1: Check for error codes
  const errorCodes = extractErrorCodes(message);

  if (errorCodes.length > 0) {
    // Search for exact error code matches
    for (const code of errorCodes) {
      try {
        const results = await searchIssues(code, { state: 'open', limit: 5 });

        if (results.length > 0) {
          // Return first matching issue
          return {
            number: results[0].number,
            url: results[0].html_url,
            title: results[0].title,
            match_type: 'error_code',
            match_value: code,
            similarity: 1.0
          };
        }
      } catch (error) {
        // Continue to keyword search if error code search fails
      }
    }
  }

  // Step 2: Keyword-based search
  const keywords = extractKeywords(message);

  if (keywords.length === 0) {
    return null; // No keywords to search
  }

  // Search with top 5 keywords
  const searchQuery = keywords.slice(0, 5).join(' ');

  try {
    const results = await searchIssues(searchQuery, { state: 'open', limit: 10 });

    // Calculate similarity for each result
    for (const issue of results) {
      const combinedText = `${issue.title} ${issue.body || ''}`;
      const similarity = calculateSimilarity(message, combinedText);

      if (similarity >= similarityThreshold) {
        return {
          number: issue.number,
          url: issue.html_url,
          title: issue.title,
          match_type: 'keywords',
          match_value: keywords.slice(0, 5).join(', '),
          similarity: similarity
        };
      }
    }
  } catch (error) {
    // No duplicates found or search failed
  }

  return null; // No duplicate found
}

/**
 * Generate issue body from feedback message
 *
 * @param {string} message - User feedback message
 * @param {Object} systemInfo - System information
 * @returns {string} Formatted issue body (markdown)
 */
function generateIssueBody(message, systemInfo = {}) {
  const {
    ccmVersion = 'unknown',
    nodeVersion = 'unknown',
    platform = 'unknown',
    includeSystemInfo = false
  } = systemInfo;

  let body = `## User Feedback\n\n${message}\n\n`;

  body += '---\n\n';
  body += '**Submitted via:** CCM Feedback System\n';
  body += `**CCM Version:** ${ccmVersion}\n`;

  if (includeSystemInfo) {
    body += `**Node Version:** ${nodeVersion}\n`;
    body += `**Platform:** ${platform}\n`;
  }

  body +=
    '\n**Note:** This issue was automatically created from user feedback. Please triage and assign labels as needed.\n';

  return body;
}

module.exports = {
  searchIssues,
  createIssue,
  findDuplicateIssue,
  extractErrorCodes,
  extractKeywords,
  calculateSimilarity,
  generateIssueBody
};
