/**
 * Simple test script for SEO Headings Structure Analyzer
 * 
 * @author MySmartDigital
 * @description Simple test to verify basic functionality without API server
 */

const { HeadingsAnalyzer } = require('./src/headings-analyzer');
const { URLNormalizer } = require('./src/url-normalizer');
const axios = require('axios');

async function testHeadingsAnalyzer() {
    console.log('🧪 Testing Headings Analyzer...\n');

    try {
        // Initialize components
        const analyzer = new HeadingsAnalyzer({
            userAgent: 'Mozilla/5.0 (compatible; SEO-Headings-Analyzer-Test/1.0)',
            timeout: 10000,
            maxRedirects: 5,
            includeHeadingText: true,
            includeHeadingStructure: true,
            includeHeadingScore: true
        });

        const urlNormalizer = new URLNormalizer();

        // Test URL
        const testUrl = 'https://example.com';
        console.log(`Testing with URL: ${testUrl}`);

        // Fetch page content
        console.log('Fetching page content...');
        const response = await axios.get(testUrl, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (compatible; SEO-Headings-Analyzer-Test/1.0)',
                'Accept-Language': 'en-US,en;q=0.9',
                'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8'
            },
            timeout: 10000,
            maxRedirects: 5,
            validateStatus: function (status) {
                return status < 500;
            }
        });

        const html = response.data;
        const statusCode = response.status;
        const normalizedUrl = urlNormalizer.normalize(testUrl);
        const baseDomain = new URL(testUrl).origin;

        console.log(`Page fetched successfully (Status: ${statusCode})`);
        console.log(`Normalized URL: ${normalizedUrl}`);

        // Analyze headings
        console.log('\nAnalyzing headings...');
        const startTime = Date.now();
        
        const result = await analyzer.analyzePage({
            url: normalizedUrl,
            html,
            baseDomain
        });

        const endTime = Date.now();
        const duration = endTime - startTime;

        console.log(`Analysis completed in ${duration}ms\n`);

        // Display results
        console.log('📊 Analysis Results:');
        console.log(`- Total Headings: ${result.totalHeadings}`);
        console.log(`- H1 Count: ${result.h1Count}`);
        console.log(`- H2 Count: ${result.h2Count}`);
        console.log(`- H3 Count: ${result.h3Count}`);
        console.log(`- H4 Count: ${result.h4Count}`);
        console.log(`- H5 Count: ${result.h5Count}`);
        console.log(`- H6 Count: ${result.h6Count}`);
        
        if (result.headingScore !== undefined) {
            console.log(`- Heading Score: ${result.headingScore}/100`);
        }

        // Show heading text if available
        if (result.h1 && result.h1.length > 0) {
            console.log('\n📝 H1 Headings:');
            result.h1.forEach((heading, index) => {
                console.log(`  ${index + 1}. "${heading}"`);
            });
        }

        if (result.h2 && result.h2.length > 0) {
            console.log('\n📝 H2 Headings:');
            result.h2.forEach((heading, index) => {
                console.log(`  ${index + 1}. "${heading}"`);
            });
        }

        if (result.h3 && result.h3.length > 0) {
            console.log('\n📝 H3 Headings:');
            result.h3.forEach((heading, index) => {
                console.log(`  ${index + 1}. "${heading}"`);
            });
        }

        // Show heading structure if available
        if (result.headingStructure && result.headingStructure.length > 0) {
            console.log('\n🏗️ Heading Structure:');
            result.headingStructure.forEach((heading, index) => {
                console.log(`  ${index + 1}. ${heading.tag.toUpperCase()}: "${heading.text}" (${heading.length} chars, ${heading.wordCount} words)`);
            });
        }

        // Show issues if any
        if (result.headingIssues && result.headingIssues.length > 0) {
            console.log('\n⚠️ Heading Issues:');
            result.headingIssues.forEach((issue, index) => {
                console.log(`  ${index + 1}. ${issue}`);
            });
        }

        // Show recommendations if any
        if (result.headingRecommendations && result.headingRecommendations.length > 0) {
            console.log('\n💡 Recommendations:');
            result.headingRecommendations.forEach((rec, index) => {
                console.log(`  ${index + 1}. ${rec}`);
            });
        }

        console.log('\n✅ Test completed successfully!');
        return true;

    } catch (error) {
        console.error('❌ Test failed:', error.message);
        if (error.response) {
            console.error('Response status:', error.response.status);
            console.error('Response data:', error.response.data);
        }
        return false;
    }
}

// Run test if this file is executed directly
if (require.main === module) {
    testHeadingsAnalyzer().catch(console.error);
}

module.exports = { testHeadingsAnalyzer };
