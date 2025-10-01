# MSD Headings Analysis Actor

A specialized Apify actor for analyzing heading structure, hierarchy, and SEO optimization on websites. This actor analyzes the specific pages you specify (via startUrl and maxPages) and provides comprehensive heading analysis without automatic crawling.

## Features

- **Comprehensive Heading Analysis**: Analyzes H1-H6 heading structure and hierarchy
- **Heading Score Calculation**: Advanced scoring system based on SEO best practices
- **Issue Detection**: Identifies common heading problems and provides recommendations
- **Configurable Analysis**: Choose what aspects to analyze (text, structure, scores)
- **Domain-Level Statistics**: Aggregated analysis across specified pages
- **SEO Optimization**: Focuses on heading structure for better search engine visibility
- **Focused Analysis**: Analyzes only the pages you specify, no automatic crawling

## Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd msd-headings
```

2. Install dependencies:
```bash
npm install
```

## Usage

### Basic Usage

```bash
npm start
```

### Input Parameters

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `startUrl` | string | Yes | - | The homepage URL to start crawling from |
| `maxPages` | integer | Yes | 2 | Maximum number of pages to crawl and analyze |
| `userAgent` | string | No | Mozilla/5.0 (compatible; MSD-Headings/1.0) | User agent string for requests |
| `timeout` | integer | No | 10000 | Request timeout in milliseconds |
| `maxRedirects` | integer | No | 5 | Maximum number of redirects to follow |
| `includeHeadingText` | boolean | No | true | Whether to include actual heading text content |
| `includeHeadingStructure` | boolean | No | true | Whether to include detailed structure analysis |
| `includeHeadingScore` | boolean | No | true | Whether to calculate and include heading scores |

### Example Input

```json
{
  "startUrl": "https://rouvres77.fr/",
  "maxPages": 2,
  "userAgent": "Mozilla/5.0 (compatible; MSD-Headings/1.0)",
  "timeout": 10000,
  "maxRedirects": 5,
  "includeHeadingText": true,
  "includeHeadingStructure": true,
  "includeHeadingScore": true
}
```

## Output Format

The actor returns a comprehensive analysis in two ways:

1. **Key-Value Store** (`OUTPUT` key): Direct object format (recommended for API consumption)
2. **Dataset**: Array-wrapped format (standard Apify dataset format)

### Key-Value Store Output (Recommended)

Access via `Actor.getValue('OUTPUT')` or through the Apify platform's key-value store. This returns the data directly as an object:

```json
{
  "domain": {
    "domain_name": "https://example.com",
    "total_pages_analyzed": 2,
    "total_headings": 15,
    "total_h1": 2,
    "total_h2": 8,
    "total_h3": 5,
    "average_heading_score": 85,
    "pages_with_h1": 2,
    "pages_with_h1_percentage": 100,
    "pages_with_good_structure": 1,
    "pages_with_good_structure_percentage": 50,
    "total_heading_issues": 3,
    "critical_issues": 1,
    "warning_issues": 2,
    "analysis_summary": {
      "has_heading_issues": true,
      "needs_h1_improvement": false,
      "has_good_structure": true,
      "average_score_grade": "B"
    }
  },
  "pages": [
    {
      "url": "https://example.com/",
      "pageStatusCode": 200,
      "analysis_date": "2024-01-01T00:00:00.000Z",
      "data_source": "msd_headings",
      "h1": ["Main Page Title"],
      "h2": ["Section 1", "Section 2"],
      "h3": ["Subsection 1.1"],
      "h1Count": 1,
      "h2Count": 2,
      "h3Count": 1,
      "totalHeadings": 4,
      "headingStructure": [
        {
          "tag": "h1",
          "level": 1,
          "text": "Main Page Title",
          "position": 1,
          "length": 16,
          "wordCount": 3
        }
      ],
      "headingScore": 85,
      "headingIssues": ["heading text too short"],
      "headingRecommendations": ["Some headings are too short - aim for 10-100 characters"]
    }
  ],
  "analysis": {
    "total_pages_processed": 2,
    "analysis_completed_at": "2024-01-01T00:00:00.000Z",
    "headings_engine_version": "1.0.0",
    "data_format_version": "1.0"
  }
}
```

### Dataset Output

The dataset contains the same data but wrapped in an array (standard Apify format):

```json
[
  {
    "domain": { ... },
    "pages": [ ... ],
    "analysis": { ... }
  }
]
```

### Accessing Output Data

**In Apify Platform:**
- **Key-Value Store**: Go to "Key-value store" tab and look for the `OUTPUT` key
- **Dataset**: Go to "Dataset" tab to see the array-wrapped data

**In Code:**
```javascript
// Get direct object (recommended)
const result = await Actor.getValue('OUTPUT');

// Get dataset data (array-wrapped)
const dataset = await Actor.getDataset();
const result = dataset.items[0]; // First (and only) item
```

**In API Response:**
The local API server returns the data directly as an object (not array-wrapped).

## Heading Analysis Details

### Heading Structure Analysis
- **H1-H6 Counts**: Counts of each heading level
- **Heading Text**: Actual text content of headings (optional)
- **Hierarchy Analysis**: Checks for proper heading hierarchy
- **Position Tracking**: Order of headings on the page

### Heading Score Calculation (0-100)
The scoring system evaluates:

1. **H1 Presence (20 points)**
   - Single H1: 20 points
   - Multiple H1s: 10 points
   - No H1: 0 points

2. **Proper Hierarchy (30 points)**
   - Penalizes skipped levels (H1 → H3)
   - Rewards good hierarchy progression
   - Considers maximum hierarchy depth

3. **Title Relevance (20 points)**
   - Checks if headings contain keywords from page title
   - Improves SEO relevance

4. **Content Distribution (30 points)**
   - Rewards pages with multiple H2s and H3s
   - Encourages good content organization

### Issue Detection
The analyzer identifies common heading problems:

- **Critical Issues**: Missing H1, multiple H1s, skipped hierarchy levels
- **Warning Issues**: Too many consecutive same-level headings, text length issues
- **Info Issues**: General recommendations for improvement

### Recommendations
Automated recommendations based on analysis:
- H1 structure improvements
- Hierarchy optimization suggestions
- Text length recommendations
- Score-based improvement tips

## Development

### Running Tests
```bash
npm test
```

### Local Development
```bash
npm run dev
```

### API Server
```bash
npm run api
```

## Configuration

### Environment Variables

Create a `.env` file with the following variables:

```env
# Optional: Override default user agent
USER_AGENT=Mozilla/5.0 (compatible; MSD-Headings/1.0)

# Optional: Override default timeout
DEFAULT_TIMEOUT=10000

# Optional: Override default max redirects
DEFAULT_MAX_REDIRECTS=5
```

## Performance Considerations

- **Efficient Parsing**: Uses Cheerio for fast HTML parsing
- **Configurable Analysis**: Choose only needed analysis features
- **Memory Management**: Optimized for processing multiple pages
- **Error Handling**: Graceful handling of parsing and network errors

## SEO Best Practices Analyzed

1. **Single H1 per Page**: Ensures proper page structure
2. **Logical Hierarchy**: H1 → H2 → H3 progression
3. **Appropriate Text Length**: 10-100 character headings
4. **Keyword Relevance**: Headings related to page title
5. **Content Organization**: Multiple H2s and H3s for structure

## License

MIT License - see LICENSE file for details.

## Support

For issues and questions, please contact MySmartDigital support.