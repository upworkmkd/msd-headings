/**
 * Headings Analyzer for SEO Headings Structure Analyzer
 * 
 * @author MySmartDigital
 * @description Core headings analysis engine that extracts and analyzes heading structure,
 * hierarchy, and SEO optimization from web pages.
 */

const cheerio = require('cheerio');
const axios = require('axios');

class HeadingsAnalyzer {
    constructor(options = {}) {
        this.userAgent = options.userAgent || 'Mozilla/5.0 (compatible; SEO-Headings-Analyzer/1.0)';
        this.timeout = options.timeout || 10000;
        this.maxRedirects = options.maxRedirects || 5;
        this.includeHeadingText = options.includeHeadingText !== false;
        this.includeHeadingStructure = options.includeHeadingStructure !== false;
        this.includeHeadingScore = options.includeHeadingScore !== false;
        this.cheerio = cheerio;
    }

    async analyzePage({ url, html, baseDomain }) {
        const $ = this.cheerio.load(html);
        
        // Extract page title for heading score calculation
        const title = $('title').text().trim() || '';
        
        // Basic heading analysis
        const basicHeadings = this.analyzeHeadings($);
        
        // Detailed heading structure analysis
        const headingStructure = this.includeHeadingStructure ? 
            this.analyzeHeadingStructure($) : [];
        
        // Calculate heading score
        const headingScore = this.includeHeadingScore ? 
            this.calculateHeadingScore(headingStructure, title) : undefined;
        
        // Analyze heading issues
        const headingIssues = this.analyzeHeadingIssues(basicHeadings, headingStructure);
        
        // Generate recommendations
        const headingRecommendations = this.generateRecommendations(basicHeadings, headingStructure, headingScore);
        
        // Extract internal links for crawling (but don't include in response)
        const internalLinks = this.extractInternalLinks($, url, baseDomain);
        
        return {
            // Basic heading counts and text
            ...basicHeadings,
            totalHeadings: basicHeadings.h1Count + basicHeadings.h2Count + basicHeadings.h3Count + 
                          basicHeadings.h4Count + basicHeadings.h5Count + basicHeadings.h6Count,
            
            // Detailed analysis
            headingStructure: headingStructure,
            headingScore: headingScore,
            headingIssues: headingIssues,
            headingRecommendations: headingRecommendations,
            
            // Additional metadata
            pageTitle: title,
            
            // Internal links for crawling (not included in final response)
            _internalLinks: internalLinks
        };
    }

    analyzeHeadings($) {
        const headings = {
            h1: [],
            h2: [],
            h3: [],
            h4: [],
            h5: [],
            h6: []
        };
        
        const counts = {
            h1Count: 0,
            h2Count: 0,
            h3Count: 0,
            h4Count: 0,
            h5Count: 0,
            h6Count: 0
        };

        for (let i = 1; i <= 6; i++) {
            const selector = `h${i}`;
            const elements = $(selector);
            
            elements.each((_, el) => {
                const text = $(el).text().trim();
                if (text) {
                    if (this.includeHeadingText) {
                        headings[`h${i}`].push(text);
                    }
                    counts[`h${i}Count`]++;
                }
            });
        }

        return {
            ...headings,
            ...counts
        };
    }

    analyzeHeadingStructure($) {
        const headings = [];

        $('h1, h2, h3, h4, h5, h6').each((index, element) => {
            const $el = $(element);
            const tag = $el.get(0).tagName.toLowerCase();
            const level = parseInt(tag.charAt(1));
            const text = $el.text().trim();

            if (text) {
                headings.push({
                    tag: tag,
                    level: level,
                    text: text,
                    position: headings.length + 1,
                    length: text.length,
                    wordCount: text.split(/\s+/).filter(word => word.length > 0).length
                });
            }
        });

        return headings;
    }

    calculateHeadingScore(headings, title) {
        let score = 0;
        let maxScore = 100;

        // 1. H1 presence (20 points)
        const h1Count = headings.filter(h => h.tag === 'h1').length;
        if (h1Count === 1) {
            score += 20;
        } else if (h1Count === 0) {
            // No penalty, but less optimal
        } else {
            score += 10; // Multiple H1s get some points but not full
        }

        // 2. Proper hierarchy (30 points)
        let hierarchyScore = 0;
        let previousLevel = 0;
        let consecutiveSameLevel = 0;
        let maxHierarchy = 0;

        for (const heading of headings) {
            if (heading.level > previousLevel + 1 && previousLevel !== 0) {
                hierarchyScore -= 5; // Skip levels
            } else if (heading.level === previousLevel) {
                consecutiveSameLevel++;
                if (consecutiveSameLevel > 2) {
                    hierarchyScore -= 2; // Too many consecutive same level
                }
            } else {
                consecutiveSameLevel = 0;
            }

            previousLevel = heading.level;
            maxHierarchy = Math.max(maxHierarchy, heading.level);
        }

        // Bonus for good hierarchy
        hierarchyScore += Math.min(maxHierarchy * 5, 20);
        hierarchyScore = Math.max(hierarchyScore, 0);
        score += Math.min(hierarchyScore, 30);

        // 3. Title relevance (20 points)
        if (title) {
            const titleWords = title.toLowerCase().split(/\s+/);
            const titleHasKeywords = headings.some(h =>
                h.text.toLowerCase().split(/\s+/).some(word =>
                    titleWords.includes(word)
                )
            );
            if (titleHasKeywords) {
                score += 20;
            }
        }

        // 4. Content distribution (30 points)
        const h2Count = headings.filter(h => h.tag === 'h2').length;
        const h3Count = headings.filter(h => h.tag === 'h3').length;
        const totalHeadings = headings.length;

        if (totalHeadings >= 3) {
            score += 15;
            if (h2Count >= 2) score += 10;
            if (h3Count >= 3) score += 5;
        }

        return Math.max(0, Math.min(100, score));
    }

    analyzeHeadingIssues(basicHeadings, headingStructure) {
        const issues = [];

        // Check for missing H1
        if (basicHeadings.h1Count === 0) {
            issues.push('missing H1');
        }

        // Check for multiple H1s
        if (basicHeadings.h1Count > 1) {
            issues.push('multiple H1 tags');
        }

        // Check heading hierarchy
        let previousLevel = 0;
        for (const heading of headingStructure) {
            if (heading.level > previousLevel + 1 && previousLevel !== 0) {
                issues.push('heading hierarchy skipped levels');
            }
            previousLevel = heading.level;
        }

        // Check for heading text issues
        headingStructure.forEach(heading => {
            if (heading.length < 10) {
                issues.push('heading text too short');
            } else if (heading.length > 100) {
                issues.push('heading text too long');
            }
        });

        // Check for consecutive same level headings
        let consecutiveSameLevel = 0;
        let currentLevel = 0;
        for (const heading of headingStructure) {
            if (heading.level === currentLevel) {
                consecutiveSameLevel++;
                if (consecutiveSameLevel > 2) {
                    issues.push('too many consecutive same level headings');
                }
            } else {
                consecutiveSameLevel = 0;
                currentLevel = heading.level;
            }
        }

        return [...new Set(issues)]; // Remove duplicates
    }

    generateRecommendations(basicHeadings, headingStructure, headingScore) {
        const recommendations = [];

        // H1 recommendations
        if (basicHeadings.h1Count === 0) {
            recommendations.push('Add a single H1 tag to each page for better SEO');
        } else if (basicHeadings.h1Count > 1) {
            recommendations.push('Use only one H1 tag per page for better SEO structure');
        }

        // Hierarchy recommendations
        if (headingStructure.length > 0) {
            const hasH2 = basicHeadings.h2Count > 0;
            const hasH3 = basicHeadings.h3Count > 0;
            
            if (!hasH2 && headingStructure.length > 1) {
                recommendations.push('Consider adding H2 tags to organize content better');
            }
            
            if (hasH2 && !hasH3 && basicHeadings.h2Count > 2) {
                recommendations.push('Consider adding H3 tags to create better content hierarchy');
            }
        }

        // Score-based recommendations
        if (headingScore !== undefined) {
            if (headingScore < 50) {
                recommendations.push('Improve heading structure and hierarchy for better SEO');
            } else if (headingScore < 80) {
                recommendations.push('Good heading structure, consider minor improvements');
            } else {
                recommendations.push('Excellent heading structure!');
            }
        }

        // Text length recommendations
        const shortHeadings = headingStructure.filter(h => h.length < 10);
        const longHeadings = headingStructure.filter(h => h.length > 100);
        
        if (shortHeadings.length > 0) {
            recommendations.push('Some headings are too short - aim for 10-100 characters');
        }
        
        if (longHeadings.length > 0) {
            recommendations.push('Some headings are too long - consider shortening to under 100 characters');
        }

        return recommendations;
    }

    extractInternalLinks($, baseUrl, baseDomain) {
        const links = $('a[href]');
        const internalLinks = [];
        
        links.each((_, link) => {
            const href = $(link).attr('href');
            
            if (href) {
                try {
                    const url = new URL(href, baseUrl);
                    const baseHost = new URL(baseUrl).hostname;
                    
                    // Skip hash-only links
                    const baseUrlObj = new URL(baseUrl);
                    const isHashOnlyLink = (
                        url.href === baseUrl + '#' || 
                        url.href === baseUrl + '#content' ||
                        (url.pathname === baseUrlObj.pathname && url.hash && url.hash !== '') ||
                        (url.pathname === '/' && url.hash && url.hash !== '') ||
                        (url.pathname.endsWith('/') && url.hash && url.hash !== '' && url.pathname === baseUrlObj.pathname) ||
                        href.endsWith('#')
                    );
                    
                    if (isHashOnlyLink) {
                        return;
                    }
                    
                    if (url.hostname === baseHost) {
                        internalLinks.push({
                            url: url.href,
                            anchorText: $(link).text().trim()
                        });
                    }
                } catch (e) {
                    // Skip invalid URLs
                }
            }
        });
        
        return internalLinks;
    }

}

module.exports = { HeadingsAnalyzer };
