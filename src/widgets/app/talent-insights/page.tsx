'use client';

import React from 'react';
import { useWidgetSDK } from '@nitrostack/widgets';
import styles from './styles.module.css';

interface TalentInsightsData {
  success: boolean;
  message?: string;
  employee?: {
    id: string;
    name: string;
    role: string;
    department: string;
  };
  insights?: {
    sentimentScore: number;
    flightRisk: string;
    skillMetrics: Record<string, number>;
    growthAreas: string[];
    topSkills: string[];
    aiSummary: string;
  };
}

export default function TalentInsightsWidget() {
  const { getToolOutput } = useWidgetSDK();
  const data = getToolOutput<TalentInsightsData>();

  if (!data || !data.employee || !data.insights) {
    return (
      <div className={styles.container} style={{ textAlign: 'center' }}>
        {data?.message || 'Connecting to AI Talent Analytics Engine...'}
      </div>
    );
  }

  const { employee, insights } = data;

  const initials = employee.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div className={styles.glowIcon}>🧠</div>
        <h2 className={styles.title}>AI Talent Command Center</h2>
      </div>

      <div className={styles.grid}>
        {/* Left Column: Profile & Sentiment */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          <div className={styles.glassCard}>
            <div className={styles.profileSection}>
              <div className={styles.avatar}>{initials}</div>
              <div>
                <h3 className={styles.employeeName}>{employee.name}</h3>
                <p className={styles.employeeRole}>{employee.role} • {employee.department}</p>
                <div 
                  className={`${styles.badge} ${insights.flightRisk === 'Low' ? styles.badgeRiskLow : styles.badgeRiskMedium}`}
                >
                  Flight Risk: {insights.flightRisk}
                </div>
              </div>
            </div>
            
            <div style={{ marginTop: '16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                <span style={{ fontSize: '14px', color: '#cbd5e1' }}>Overall Sentiment</span>
                <span style={{ fontSize: '14px', fontWeight: 'bold', color: '#818cf8' }}>{insights.sentimentScore}/100</span>
              </div>
              <div className={styles.metricBarContainer}>
                <div className={styles.metricBar} style={{ width: `${insights.sentimentScore}%` }} />
              </div>
            </div>
          </div>

          <div className={styles.glassCard}>
            <h4 style={{ margin: '0 0 16px 0', fontSize: '18px', color: '#f8fafc' }}>Top Strengths</h4>
            <div className={styles.tagsContainer}>
              {insights.topSkills.map((skill, idx) => (
                <span key={idx} className={styles.tag}>{skill}</span>
              ))}
            </div>
            
            <h4 style={{ margin: '24px 0 16px 0', fontSize: '18px', color: '#f8fafc' }}>Growth Areas</h4>
            <div className={styles.tagsContainer}>
              {insights.growthAreas.map((area, idx) => (
                <span key={idx} className={`${styles.tag} ${styles.tagGrowth}`}>{area}</span>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Skill Matrix & AI Summary */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          <div className={styles.glassCard}>
            <h4 style={{ margin: '0 0 24px 0', fontSize: '18px', color: '#f8fafc' }}>Core Competencies</h4>
            <div className={styles.metricsGrid}>
              {Object.entries(insights.skillMetrics).map(([skill, value]) => (
                <div key={skill} className={styles.metricRow}>
                  <div className={styles.metricLabel}>{skill}</div>
                  <div className={styles.metricBarContainer}>
                    <div className={styles.metricBar} style={{ width: `${value}%` }} />
                  </div>
                  <div style={{ fontSize: '14px', fontWeight: 'bold', width: '32px', textAlign: 'right' }}>{value}</div>
                </div>
              ))}
            </div>
          </div>

          <div className={styles.aiSummaryBox}>
            <span className={styles.aiIcon}>✨</span>
            {insights.aiSummary}
          </div>
        </div>
      </div>
    </div>
  );
}
