#!/usr/bin/env node

/**
 * Security Monitoring Script
 * 
 * This script can be run as a cron job to monitor for security threats
 * and send alerts when suspicious activity is detected.
 * 
 * Usage: node scripts/security-monitor.js
 * Cron: */5 * * * * node /path/to/security-monitor.js
 */

const fs = require('fs');
const path = require('path');

// Configuration
const CONFIG = {
  // Thresholds for alerts
  RATE_LIMIT_THRESHOLD: 10, // Alert if same IP hits rate limit 10+ times
  BOT_DETECTION_THRESHOLD: 5, // Alert if 5+ bot detections from same IP
  GEO_BLOCK_THRESHOLD: 3, // Alert if 3+ geo blocks
  
  // Log file paths (adjust for your deployment)
  LOG_FILES: [
    '/var/log/application.log',
    process.stdout, // For development
  ],
  
  // Alert channels
  WEBHOOK_URL: process.env.SECURITY_WEBHOOK_URL, // Slack/Discord webhook
  EMAIL_ENDPOINT: process.env.SECURITY_EMAIL_API, // Email API endpoint
};

class SecurityMonitor {
  constructor() {
    this.events = [];
    this.alerts = [];
  }
  
  // Parse security events from logs
  parseSecurityEvents() {
    // In production, this would read from your actual log aggregation system
    // For now, we'll simulate reading from application logs
    
    console.log('🔍 Scanning for security events...');
    
    // Example of what to look for in logs:
    const securityPatterns = [
      /\[SECURITY\] RATE_LIMIT_EXCEEDED/,
      /\[SECURITY\] INVALID_ORIGIN/,
      /\[SECURITY\] BOT_DETECTED/,
      /\[THREAT-HIGH\]/,
      /\[THREAT-MEDIUM\]/,
    ];
    
    // This is a mock - replace with actual log parsing
    this.events = [
      // Mock events for demonstration
      {
        timestamp: new Date(),
        event: 'RATE_LIMIT_EXCEEDED',
        ip: '192.168.1.100',
        severity: 'medium',
        count: 12
      }
    ];
  }
  
  // Analyze events for threats
  analyzeThreats() {
    console.log('🧠 Analyzing threat patterns...');
    
    const ipGroups = {};
    
    // Group events by IP
    this.events.forEach(event => {
      if (!ipGroups[event.ip]) {
        ipGroups[event.ip] = [];
      }
      ipGroups[event.ip].push(event);
    });
    
    // Check for concerning patterns
    Object.entries(ipGroups).forEach(([ip, events]) => {
      const rateLimitEvents = events.filter(e => e.event === 'RATE_LIMIT_EXCEEDED');
      const botEvents = events.filter(e => e.event === 'BOT_DETECTED');
      
      if (rateLimitEvents.length >= CONFIG.RATE_LIMIT_THRESHOLD) {
        this.alerts.push({
          severity: 'high',
          type: 'PERSISTENT_RATE_LIMIT_VIOLATIONS',
          ip,
          count: rateLimitEvents.length,
          message: `IP ${ip} hit rate limits ${rateLimitEvents.length} times`,
          action: 'CONSIDER_IP_BLOCK'
        });
      }
      
      if (botEvents.length >= CONFIG.BOT_DETECTION_THRESHOLD) {
        this.alerts.push({
          severity: 'medium',
          type: 'PERSISTENT_BOT_ACTIVITY',
          ip,
          count: botEvents.length,
          message: `IP ${ip} triggered bot detection ${botEvents.length} times`,
          action: 'MONITOR_CLOSELY'
        });
      }
    });
  }
  
  // Send alerts
  async sendAlerts() {
    if (this.alerts.length === 0) {
      console.log('✅ No security alerts to send');
      return;
    }
    
    console.log(`🚨 Sending ${this.alerts.length} security alerts...`);
    
    for (const alert of this.alerts) {
      await this.sendAlert(alert);
    }
  }
  
  // Send individual alert
  async sendAlert(alert) {
    const message = this.formatAlert(alert);
    
    console.log('🔔 SECURITY ALERT:', message);
    
    // Send to webhook (Slack/Discord/Teams)
    if (CONFIG.WEBHOOK_URL) {
      try {
        await fetch(CONFIG.WEBHOOK_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            text: `🚨 Security Alert: ${message}`,
            username: 'Security Monitor',
            icon_emoji: ':warning:'
          })
        });
      } catch (error) {
        console.error('Failed to send webhook alert:', error);
      }
    }
    
    // Send email alert
    if (CONFIG.EMAIL_ENDPOINT && alert.severity === 'high') {
      try {
        await fetch(CONFIG.EMAIL_ENDPOINT, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            subject: `🚨 High Severity Security Alert`,
            message: message,
            priority: 'high'
          })
        });
      } catch (error) {
        console.error('Failed to send email alert:', error);
      }
    }
  }
  
  // Format alert message
  formatAlert(alert) {
    return `
**${alert.type}**
Severity: ${alert.severity.toUpperCase()}
IP: ${alert.ip}
Count: ${alert.count}
Message: ${alert.message}
Recommended Action: ${alert.action}
Time: ${new Date().toISOString()}
`.trim();
  }
  
  // Generate security report
  generateReport() {
    const report = {
      timestamp: new Date().toISOString(),
      summary: {
        totalEvents: this.events.length,
        totalAlerts: this.alerts.length,
        highSeverityAlerts: this.alerts.filter(a => a.severity === 'high').length,
        uniqueIPs: new Set(this.events.map(e => e.ip)).size
      },
      alerts: this.alerts,
      topIPs: this.getTopIPs(),
      recommendations: this.getRecommendations()
    };
    
    // Save report
    const reportPath = `./security-report-${Date.now()}.json`;
    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
    
    console.log(`📊 Security report saved to: ${reportPath}`);
    return report;
  }
  
  // Get top offending IPs
  getTopIPs() {
    const ipCounts = {};
    this.events.forEach(event => {
      ipCounts[event.ip] = (ipCounts[event.ip] || 0) + 1;
    });
    
    return Object.entries(ipCounts)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 10)
      .map(([ip, count]) => ({ ip, count }));
  }
  
  // Get security recommendations
  getRecommendations() {
    const recommendations = [];
    
    if (this.alerts.some(a => a.type === 'PERSISTENT_RATE_LIMIT_VIOLATIONS')) {
      recommendations.push('Consider implementing IP blocking for repeat offenders');
    }
    
    if (this.alerts.some(a => a.type === 'PERSISTENT_BOT_ACTIVITY')) {
      recommendations.push('Review and strengthen bot detection mechanisms');
    }
    
    if (this.events.length > 100) {
      recommendations.push('High volume of security events - consider scaling monitoring');
    }
    
    return recommendations;
  }
  
  // Main monitoring function
  async run() {
    console.log('🛡️  Starting security monitoring...');
    
    try {
      this.parseSecurityEvents();
      this.analyzeThreats();
      await this.sendAlerts();
      this.generateReport();
      
      console.log('✅ Security monitoring completed successfully');
    } catch (error) {
      console.error('❌ Security monitoring failed:', error);
      process.exit(1);
    }
  }
}

// Run if called directly
if (require.main === module) {
  const monitor = new SecurityMonitor();
  monitor.run();
}

module.exports = SecurityMonitor;