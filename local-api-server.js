/**
 * Local API Server for MSD Headings Analysis Actor
 * 
 * @author MySmartDigital
 * @description Express server for testing the headings analysis locally
 */

const express = require('express');
const cors = require('cors');
const { HeadingsAnalyzer } = require('./src/headings-analyzer');
const { URLNormalizer } = require('./src/url-normalizer');
const axios = require('axios');

const app = express();
const PORT = process.env.PORT || 3002;

// Middleware
app.use(cors());
app.use(express.json());

// Initialize components
const urlNormalizer = new URLNormalizer();

// Health check endpoint
app.get('/health', (req, res) => {
    res.json({ 
        status: 'OK', 
        message: 'MSD Headings API is running',
        timestamp: new Date().toISOString()
    });
});

// Main analysis endpoint
app.post('/analyze', async (req, res) => {
    try {
        const {
            startUrl,
            maxPages = 2,
            userAgent = 'Mozilla/5.0 (compatible; MSD-Headings/1.0)',
            timeout = 10000,
            maxRedirects = 5,
            includeHeadingText = true,
            includeHeadingStructure = true,
            includeHeadingScore = true
        } = req.body;

        if (!startUrl) {
            return res.status(400).json({ 
                error: 'startUrl is required',
                message: 'Please provide a valid startUrl in the request body'
            });
        }

        console.log(`Starting headings analysis for: ${startUrl}`);
        console.log(`Max pages: ${maxPages}`);

        // Initialize analyzer
        const headingsAnalyzer = new HeadingsAnalyzer({
            userAgent,
            timeout,
            maxRedirects,
            includeHeadingText,
            includeHeadingStructure,
            includeHeadingScore
        });

        const results = [];
        const visitedUrls = new Set();
        const urlsToProcess = [startUrl];
        let processedCount = 0;
        
        // Extract domain from start URL
        const baseDomain = new URL(startUrl).origin;
        
        while (urlsToProcess.length > 0 && processedCount < maxPages) {
            const currentUrl = urlsToProcess.shift();
            
            if (visitedUrls.has(currentUrl)) continue;
            visitedUrls.add(currentUrl);
            
            console.log(`Processing: ${currentUrl} (${processedCount + 1}/${maxPages})`);
            
            try {
                // Fetch page content
                const response = await axios.get(currentUrl, {
                    headers: {
                        'User-Agent': userAgent,
                        'Accept-Language': 'en-US,en;q=0.9',
                        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8'
                    },
                    timeout: timeout,
                    maxRedirects: maxRedirects,
                    validateStatus: function (status) {
                        return status < 500; // Accept all status codes below 500
                    }
                });

                const html = response.data;
                const statusCode = response.status;
                
                // Normalize URL
                const normalizedUrl = urlNormalizer.normalize(currentUrl);
                
                // Analyze headings on this page
                const headingsData = await headingsAnalyzer.analyzePage({
                    url: normalizedUrl,
                    html,
                    baseDomain
                });
                
                // Create page result
                const pageResult = {
                    url: normalizedUrl,
                    pageStatusCode: statusCode,
                    analysis_date: new Date().toISOString(),
                    data_source: 'msd_headings',
                    ...headingsData
                };

                results.push(pageResult);
                
                console.log(`Completed analysis for: ${normalizedUrl} (Status: ${statusCode})`);
                console.log(`Found ${headingsData.totalHeadings} headings (H1: ${headingsData.h1Count}, H2: ${headingsData.h2Count}, H3: ${headingsData.h3Count})`);
                if (headingsData.headingScore !== undefined) {
                    console.log(`Heading Score: ${headingsData.headingScore}/100`);
                }
                
                processedCount++;
                
            } catch (error) {
                console.error(`Error analyzing ${currentUrl}:`, error);

                // Determine status code based on error type
                let statusCode = 500;
                if (error.response) {
                    statusCode = error.response.status;
                } else if (error.code === 'ENOTFOUND' || error.code === 'ECONNREFUSED') {
                    statusCode = 404;
                } else if (error.code === 'ETIMEDOUT') {
                    statusCode = 408;
                } else if (error.code === 'ECONNRESET') {
                    statusCode = 503;
                }

                // Add error result
                results.push({
                    url: currentUrl,
                    error: error.message,
                    pageStatusCode: statusCode,
                    analysis_date: new Date().toISOString(),
                    data_source: 'msd_headings',
                    totalHeadings: 0,
                    h1Count: 0,
                    h2Count: 0,
                    h3Count: 0,
                    h4Count: 0,
                    h5Count: 0,
                    h6Count: 0,
                    headingScore: 0,
                    headingStructure: [],
                    headingIssues: [],
                    headingRecommendations: []
                });
            }
        }
        
        // Calculate domain-level analysis
        const domainAnalysis = calculateDomainAnalysis(results, baseDomain);

        // Create comprehensive result structure
        const finalOutput = {
            domain: domainAnalysis,
            pages: results,
            analysis: {
                total_pages_processed: results.length,
                analysis_completed_at: new Date().toISOString(),
                headings_engine_version: '1.0.0',
                data_format_version: '1.0'
            }
        };

        console.log(`Headings Analysis completed! Processed ${results.length} pages.`);
        console.log(`Average heading score: ${domainAnalysis.average_heading_score}/100`);
        console.log(`Pages with proper H1: ${domainAnalysis.pages_with_h1_percentage}%`);

        res.json(finalOutput);

    } catch (error) {
        console.error('API Error:', error);
        res.status(500).json({ 
            error: 'Internal server error',
            message: error.message 
        });
    }
});

// Domain-level analysis calculation
function calculateDomainAnalysis(results, baseDomain) {
    console.log('Calculating domain-level analysis...');

    // Calculate totals across all pages
    const totalHeadings = results.reduce((sum, r) => sum + (r.totalHeadings || 0), 0);
    const totalH1 = results.reduce((sum, r) => sum + (r.h1Count || 0), 0);
    const totalH2 = results.reduce((sum, r) => sum + (r.h2Count || 0), 0);
    const totalH3 = results.reduce((sum, r) => sum + (r.h3Count || 0), 0);
    const totalH4 = results.reduce((sum, r) => sum + (r.h4Count || 0), 0);
    const totalH5 = results.reduce((sum, r) => sum + (r.h5Count || 0), 0);
    const totalH6 = results.reduce((sum, r) => sum + (r.h6Count || 0), 0);

    // Calculate averages
    const averageHeadingsPerPage = results.length > 0 ? Math.round(totalHeadings / results.length) : 0;
    const averageH1PerPage = results.length > 0 ? Math.round((totalH1 / results.length) * 100) / 100 : 0;
    const averageH2PerPage = results.length > 0 ? Math.round((totalH2 / results.length) * 100) / 100 : 0;
    const averageH3PerPage = results.length > 0 ? Math.round((totalH3 / results.length) * 100) / 100 : 0;

    // Calculate heading scores
    const validScores = results.filter(r => r.headingScore !== undefined && r.headingScore !== null);
    const averageHeadingScore = validScores.length > 0 
        ? Math.round(validScores.reduce((sum, r) => sum + r.headingScore, 0) / validScores.length)
        : 0;

    // Page-level statistics
    const pagesWithH1 = results.filter(r => (r.h1Count || 0) > 0).length;
    const pagesWithMultipleH1 = results.filter(r => (r.h1Count || 0) > 1).length;
    const pagesWithNoH1 = results.filter(r => (r.h1Count || 0) === 0).length;
    const pagesWithH2 = results.filter(r => (r.h2Count || 0) > 0).length;
    const pagesWithH3 = results.filter(r => (r.h3Count || 0) > 0).length;
    const pagesWithGoodStructure = results.filter(r => {
        const h1Count = r.h1Count || 0;
        const h2Count = r.h2Count || 0;
        return h1Count === 1 && h2Count > 0;
    }).length;

    // Collect all heading issues
    const allHeadingIssues = [];
    results.forEach(page => {
        if (page.headingIssues && page.headingIssues.length > 0) {
            page.headingIssues.forEach(issue => {
                allHeadingIssues.push({
                    issue: issue,
                    page: page.url,
                    severity: getIssueSeverity(issue)
                });
            });
        }
    });

    // Group issues by type
    const issuesByType = {};
    allHeadingIssues.forEach(issue => {
        if (!issuesByType[issue.issue]) {
            issuesByType[issue.issue] = [];
        }
        issuesByType[issue.issue].push(issue);
    });

    // Calculate issue statistics
    const criticalIssues = allHeadingIssues.filter(i => i.severity === 'critical').length;
    const warningIssues = allHeadingIssues.filter(i => i.severity === 'warning').length;
    const infoIssues = allHeadingIssues.filter(i => i.severity === 'info').length;

    const domainAnalysis = {
        domain_name: baseDomain,
        total_pages_analyzed: results.length,
        
        // Heading counts
        total_headings: totalHeadings,
        total_h1: totalH1,
        total_h2: totalH2,
        total_h3: totalH3,
        total_h4: totalH4,
        total_h5: totalH5,
        total_h6: totalH6,
        
        // Averages
        average_headings_per_page: averageHeadingsPerPage,
        average_h1_per_page: averageH1PerPage,
        average_h2_per_page: averageH2PerPage,
        average_h3_per_page: averageH3PerPage,
        average_heading_score: averageHeadingScore,
        
        // Page-level statistics
        pages_with_h1: pagesWithH1,
        pages_with_h1_percentage: Math.round((pagesWithH1 / results.length) * 100),
        pages_with_multiple_h1: pagesWithMultipleH1,
        pages_with_multiple_h1_percentage: Math.round((pagesWithMultipleH1 / results.length) * 100),
        pages_with_no_h1: pagesWithNoH1,
        pages_with_no_h1_percentage: Math.round((pagesWithNoH1 / results.length) * 100),
        pages_with_h2: pagesWithH2,
        pages_with_h2_percentage: Math.round((pagesWithH2 / results.length) * 100),
        pages_with_h3: pagesWithH3,
        pages_with_h3_percentage: Math.round((pagesWithH3 / results.length) * 100),
        pages_with_good_structure: pagesWithGoodStructure,
        pages_with_good_structure_percentage: Math.round((pagesWithGoodStructure / results.length) * 100),
        
        // Issues analysis
        total_heading_issues: allHeadingIssues.length,
        critical_issues: criticalIssues,
        warning_issues: warningIssues,
        info_issues: infoIssues,
        issues_by_type: issuesByType,
        
        // Summary
        analysis_summary: {
            has_heading_issues: allHeadingIssues.length > 0,
            needs_h1_improvement: pagesWithNoH1 > 0 || pagesWithMultipleH1 > 0,
            has_good_structure: pagesWithGoodStructure > 0,
            average_score_grade: getScoreGrade(averageHeadingScore)
        }
    };

    console.log(`Domain Analysis Summary:`);
    console.log(`- Domain: ${baseDomain}`);
    console.log(`- Total Headings: ${totalHeadings}`);
    console.log(`- Average Score: ${averageHeadingScore}/100`);
    console.log(`- Pages with H1: ${pagesWithH1}/${results.length} (${domainAnalysis.pages_with_h1_percentage}%)`);
    console.log(`- Critical Issues: ${criticalIssues}`);

    return domainAnalysis;
}

// Helper function to determine issue severity
function getIssueSeverity(issue) {
    const criticalIssues = [
        'missing H1',
        'multiple H1 tags',
        'heading hierarchy skipped levels'
    ];
    
    const warningIssues = [
        'too many consecutive same level headings',
        'heading text too short',
        'heading text too long'
    ];
    
    if (criticalIssues.some(ci => issue.toLowerCase().includes(ci.toLowerCase()))) {
        return 'critical';
    } else if (warningIssues.some(wi => issue.toLowerCase().includes(wi.toLowerCase()))) {
        return 'warning';
    } else {
        return 'info';
    }
}

// Helper function to get score grade
function getScoreGrade(score) {
    if (score >= 90) return 'A';
    if (score >= 80) return 'B';
    if (score >= 70) return 'C';
    if (score >= 60) return 'D';
    return 'F';
}

// Start server
app.listen(PORT, () => {
    console.log(`MSD Headings API server running on port ${PORT}`);
    console.log(`Health check: http://localhost:${PORT}/health`);
    console.log(`Analysis endpoint: http://localhost:${PORT}/analyze`);
});
