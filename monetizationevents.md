# Monetization Events - SEO Headings Structure Analyzer

This document describes the monetization events (usage counters) configured for the SEO Headings Structure Analyzer Actor on the Apify platform.

## Actor Information

- **Actor ID:** `seo-headings-structure-analyzer`
- **Actor Name:** SEO Headings Structure Analyzer
- **Description:** Analyzes website heading structures for SEO optimization and accessibility compliance

## Monetization Events

### PAGE_ANALYZED

**Label:** Pages analyzed  
**Description:** Number of web pages analyzed for heading structure and SEO optimization

**When It's Triggered:**
- Every time a page is successfully analyzed for heading structure
- Triggered for each page processed, including:
  - The start URL provided in input
  - Any additional pages discovered during crawling (if `crawlUrls` is enabled)
- Only counts pages that are actually analyzed (not skipped duplicates)

**Implementation Location:**
- File: `src/main.js`
- Line: After each page analysis completes successfully
- Code: `await Actor.incrementUsageCounter('PAGE_ANALYZED');`

**Usage in Apify:**
```json
{
  "usageCounters": {
    "PAGE_ANALYZED": {
      "label": "Pages analyzed",
      "description": "Number of web pages analyzed for heading structure and SEO optimization"
    }
  }
}
```

## Implementation Details

### Code Pattern

The monetization event is incremented after successful page analysis:

```javascript
// After headings analysis completes
results.push(pageResult);

// Track this page analysis as a billable event for monetization
await Actor.incrementUsageCounter('PAGE_ANALYZED');
pagesAnalyzedCount++;

console.log(`Completed analysis for: ${normalizedUrl} (Status: ${statusCode})`);
```

### Event Triggering Rules

1. **Success Only**: Events are only incremented on successful page analysis, not on errors
2. **No Duplicates**: URL normalization ensures pages aren't counted twice (duplicate URLs are skipped)
3. **Per Page**: Each page analyzed increments the counter by 1, regardless of:
   - Number of headings found
   - Heading structure quality
   - Number of issues detected

### Configuration

The usage counter is defined in `.actor/actor.json`:

```json
{
  "usageCounters": {
    "PAGE_ANALYZED": {
      "label": "Pages analyzed",
      "description": "Number of web pages analyzed for heading structure and SEO optimization"
    }
  }
}
```

## Adding to Apify Platform

To add this event to your Apify actor:

1. Navigate to your actor in Apify Console
2. Go to **Settings** → **Monetization**
3. Add usage counter:
   - **Counter Name:** `PAGE_ANALYZED`
   - **Label:** "Pages analyzed"
   - **Description:** "Number of web pages analyzed for heading structure and SEO optimization"
4. Set pricing per event as needed

## Monitoring Usage

Usage counters can be monitored via:

1. **Apify Console:** Actor → Runs → View usage statistics
2. **Apify API:** `GET /v2/actor-runs/{runId}` → `usage` property
3. **Actor Logs:** Console logs show billable event counts:
   ```
   Billable events (pages analyzed): 5
   ```

## Example Usage

If a user runs the actor with:
- `startUrl`: `"https://example.com"`
- `crawlUrls`: `true`
- `maxPages`: `10`

And the actor analyzes 8 pages, the `PAGE_ANALYZED` counter will be incremented 8 times.

---

**Last Updated:** 2025-01-XX

