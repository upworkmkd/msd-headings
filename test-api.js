/**
 * Test script for SEO Headings Structure Analyzer API
 * 
 * @author MySmartDigital
 * @description Test script to verify the headings analysis API functionality
 */

const axios = require('axios');

const API_BASE_URL = 'http://localhost:3002';

async function testHealthCheck() {
    try {
        console.log('Testing health check...');
        const response = await axios.get(`${API_BASE_URL}/health`);
        console.log('✅ Health check passed:', response.data);
        return true;
    } catch (error) {
        console.error('❌ Health check failed:', error.message);
        return false;
    }
}

async function testHeadingsAnalysis() {
    try {
        console.log('\nTesting headings analysis...');
        
        const testInput = {
            startUrl: 'https://mysmartdigital.fr',
            crawlUrls: true,
            maxPages: 4,
            userAgent: 'Mozilla/5.0 (compatible; SEO-Headings-Analyzer-Test/1.0)',
            timeout: 10000,
            maxRedirects: 5,
            includeHeadingText: true,
            includeHeadingStructure: true,
            includeHeadingScore: true
        };

        console.log('Input:', JSON.stringify(testInput, null, 2));

        const response = await axios.post(`${API_BASE_URL}/analyze`, testInput, {
            timeout: 60000 // 60 second timeout for the analysis
        });

        console.log('✅ Analysis completed successfully!');
        console.log('\n📊 Results Summary:');
        console.log(`- Domain: ${response.data.domain.domain_name}`);
        console.log(`- Pages Analyzed: ${response.data.domain.total_pages_analyzed}`);
        console.log(`- Total Headings: ${response.data.domain.total_headings}`);
        console.log(`- H1 Count: ${response.data.domain.total_h1}`);
        console.log(`- H2 Count: ${response.data.domain.total_h2}`);
        console.log(`- H3 Count: ${response.data.domain.total_h3}`);
        console.log(`- Average Heading Score: ${response.data.domain.average_heading_score}/100`);
        console.log(`- Pages with H1: ${response.data.domain.pages_with_h1_percentage}%`);
        console.log(`- Pages with Good Structure: ${response.data.domain.pages_with_good_structure_percentage}%`);

        if (response.data.domain.total_heading_issues > 0) {
            console.log('\n⚠️ Heading Issues Found:');
            console.log(`- Total Issues: ${response.data.domain.total_heading_issues}`);
            console.log(`- Critical Issues: ${response.data.domain.critical_issues}`);
            console.log(`- Warning Issues: ${response.data.domain.warning_issues}`);
            console.log(`- Info Issues: ${response.data.domain.info_issues}`);
        }

        console.log('\n📄 Page Details:');
        response.data.pages.forEach((page, index) => {
            console.log(`${index + 1}. ${page.url}`);
            console.log(`   Status: ${page.pageStatusCode}`);
            console.log(`   Total Headings: ${page.totalHeadings}`);
            console.log(`   H1: ${page.h1Count}, H2: ${page.h2Count}, H3: ${page.h3Count}`);
            if (page.headingScore !== undefined) {
                console.log(`   Heading Score: ${page.headingScore}/100`);
            }
            if (page.headingIssues && page.headingIssues.length > 0) {
                console.log(`   Issues: ${page.headingIssues.join(', ')}`);
            }
        });

        return true;
    } catch (error) {
        console.error('❌ Analysis test failed:', error.message);
        if (error.response) {
            console.error('Response data:', error.response.data);
        }
        return false;
    }
}

async function testWithRealWebsite() {
    try {
        console.log('\nTesting with a real website...');
        
        const testInput = {
            startUrl: 'https://httpbin.org',
            crawlUrls: false,
            maxPages: 1,
            userAgent: 'Mozilla/5.0 (compatible; SEO-Headings-Analyzer-Test/1.0)',
            timeout: 10000,
            maxRedirects: 3,
            includeHeadingText: true,
            includeHeadingStructure: true,
            includeHeadingScore: true
        };

        const response = await axios.post(`${API_BASE_URL}/analyze`, testInput, {
            timeout: 30000
        });

        console.log('✅ Real website test completed!');
        console.log(`- Total Headings Found: ${response.data.domain.total_headings}`);
        console.log(`- Average Score: ${response.data.domain.average_heading_score}/100`);
        
        return true;
    } catch (error) {
        console.error('❌ Real website test failed:', error.message);
        return false;
    }
}

async function runAllTests() {
    console.log('🚀 Starting SEO Headings Structure Analyzer API Tests\n');
    
    const healthCheck = await testHealthCheck();
    if (!healthCheck) {
        console.log('\n❌ Health check failed. Make sure the API server is running.');
        console.log('Run: npm run api');
        return;
    }

    const analysisTest = await testHeadingsAnalysis();
    const realWebsiteTest = await testWithRealWebsite();

    console.log('\n📋 Test Results Summary:');
    console.log(`- Health Check: ${healthCheck ? '✅ PASS' : '❌ FAIL'}`);
    console.log(`- Analysis Test: ${analysisTest ? '✅ PASS' : '❌ FAIL'}`);
    console.log(`- Real Website Test: ${realWebsiteTest ? '✅ PASS' : '❌ FAIL'}`);

    const allPassed = healthCheck && analysisTest && realWebsiteTest;
    console.log(`\n🎯 Overall Result: ${allPassed ? '✅ ALL TESTS PASSED' : '❌ SOME TESTS FAILED'}`);
}

// Run tests if this file is executed directly
if (require.main === module) {
    runAllTests().catch(console.error);
}

module.exports = {
    testHealthCheck,
    testHeadingsAnalysis,
    testWithRealWebsite,
    runAllTests
};
