# Development Guide

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

## Accessing Output Data

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

## Testing

[Testing information would go here - this section appears to be missing from the original README]

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

## Heading Score Calculation (0-100)

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

## Environment Variables

Create a `.env` file with the following variables:

```env
# Optional: Override default user agent
USER_AGENT=Mozilla/5.0 (compatible; MSD-Headings/1.0)

# Optional: Override default timeout
DEFAULT_TIMEOUT=10000

# Optional: Override default max redirects
DEFAULT_MAX_REDIRECTS=5
```

## License

MIT License - see LICENSE file for details.
