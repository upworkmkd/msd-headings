# SEO Headings Structure Analyzer

A specialized Apify actor for analyzing heading structure, hierarchy, and SEO optimization on websites. This actor can analyze either a single page (startUrl only) or crawl multiple pages based on your configuration.

## Features

- **Comprehensive Heading Analysis**: Analyzes H1-H6 heading structure and hierarchy
- **Heading Score Calculation**: Advanced scoring system based on SEO best practices
- **Issue Detection**: Identifies common heading problems and provides recommendations
- **Configurable Analysis**: Choose what aspects to analyze (text, structure, scores)
- **Domain-Level Statistics**: Aggregated analysis across specified pages
- **SEO Optimization**: Focuses on heading structure for better search engine visibility
- **Flexible Crawling**: Choose between single-page analysis or multi-page crawling
- **Configurable Scope**: Control whether to crawl internal links or analyze only the start URL
- **Event-Based Pricing**: Pay per page analyzed - transparent and predictable costs

## Configuration Options

### Crawling Behavior

The actor supports two analysis modes:

1. **Single Page Analysis** (Default): `crawlUrls: false`
   - Analyzes only the `startUrl`
   - Ignores the `maxPages` parameter
   - Fast and focused analysis

2. **Multi-Page Crawling**: `crawlUrls: true`
   - Crawls internal links starting from `startUrl`
   - Respects the `maxPages` parameter to limit crawling
   - Comprehensive domain analysis

### Key Parameters

- `startUrl`: The URL to start analysis from
- `crawlUrls`: Boolean flag to enable/disable multi-page crawling (default: `false`)
- `maxPages`: Maximum number of pages to analyze (only applies when `crawlUrls: true`)

## Output Format

The actor returns a comprehensive analysis in two ways:

1. **Key-Value Store** (`OUTPUT` key): Direct object format (recommended for API consumption)
2. **Dataset**: Array-wrapped format (standard Apify dataset format)

### Key-Value Store Output (Recommended)

Access via `Actor.getValue('OUTPUT')` or through the Apify platform's key-value store. This returns the data directly as an object:

```json
{
  "domain": {
    "domain_name": "https://mysmartdigital.fr/",
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
      "url": "https://mysmartdigital.fr/",
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

## Heading Analysis Details

### Heading Structure Analysis
- **H1-H6 Counts**: Counts of each heading level
- **Heading Text**: Actual text content of headings (optional)
- **Hierarchy Analysis**: Checks for proper heading hierarchy
- **Position Tracking**: Order of headings on the page

### Issue Detection
The analyzer identifies common heading problems:

- **Critical Issues**: Missing H1, multiple H1s, skipped hierarchy levels, H1 identical to page title
- **Warning Issues**: Too many consecutive same-level headings, text length issues
- **Info Issues**: General recommendations for improvement

### Recommendations
Automated recommendations based on analysis:
- H1 structure improvements
- Hierarchy optimization suggestions
- Text length recommendations
- Score-based improvement tips

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
5. **H1 vs Title Differentiation**: H1 should complement, not duplicate, the page title
6. **Content Organization**: Multiple H2s and H3s for structure

## Support

For issues and questions, please contact Smart Digital support.