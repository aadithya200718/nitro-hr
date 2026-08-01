'use client';

import React from 'react';
import { useTheme, useWidgetSDK } from '@nitrostack/widgets';

interface OnboardingData {
  success: boolean;
  message: string;
  summary: string[];
  employee?: {
    id: string;
    name: string;
    role: string;
    department: string;
  };
  tickets?: {
    id: string;
    item: string;
    status: string;
  }[];
  meeting?: {
    id: string;
    date: string;
    time: string;
  };
}

export default function OnboardingSummaryWidget() {
  const theme = useTheme();
  const { getToolOutput } = useWidgetSDK();
  const data = getToolOutput<OnboardingData>();

  if (!data) {
    return (
      <div style={{ padding: '24px', textAlign: 'center', color: theme === 'dark' ? '#fff' : '#000' }}>
        Loading Onboarding Details...
      </div>
    );
  }

  if (!data.summary) {
    return (
      <div style={{ padding: '24px', textAlign: 'center', color: theme === 'dark' ? '#fff' : '#000', background: theme === 'dark' ? 'rgba(239, 68, 68, 0.1)' : 'rgba(239, 68, 68, 0.05)', borderRadius: '16px', border: '1px solid rgba(239, 68, 68, 0.2)' }}>
        <div style={{ fontSize: '32px', marginBottom: '16px' }}>⚠️</div>
        <h2 style={{ margin: '0 0 8px 0', fontSize: '20px', color: '#ef4444' }}>Onboarding Incomplete</h2>
        <p style={{ opacity: 0.8 }}>{data.message || 'An unexpected error occurred during the onboarding process.'}</p>
      </div>
    );
  }

  const isDark = theme === 'dark';
  const bgColor = isDark ? 'linear-gradient(135deg, #1f2937 0%, #111827 100%)' : 'linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%)';
  const textColor = isDark ? '#f9fafb' : '#111827';
  const cardBg = isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(255, 255, 255, 0.6)';

  return (
    <div style={{
      padding: '24px',
      background: bgColor,
      borderRadius: '16px',
      color: textColor,
      fontFamily: 'system-ui, -apple-system, sans-serif',
      boxShadow: isDark ? '0 10px 30px rgba(0,0,0,0.5)' : '0 10px 30px rgba(0,0,0,0.1)',
      border: `1px solid ${isDark ? 'rgba(255,255,255,0.1)' : 'rgba(255,255,255,0.8)'}`,
      backdropFilter: 'blur(10px)',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', marginBottom: '24px', gap: '16px' }}>
        <div style={{
          fontSize: '32px',
          background: isDark ? 'rgba(16, 185, 129, 0.2)' : '#10b981',
          width: '56px', height: '56px',
          borderRadius: '50%',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: '0 4px 12px rgba(16, 185, 129, 0.3)'
        }}>
          🚀
        </div>
        <div>
          <h2 style={{ margin: 0, fontSize: '22px', fontWeight: 'bold' }}>Onboarding Complete</h2>
          <p style={{ margin: '4px 0 0 0', opacity: 0.8, fontSize: '14px' }}>
            {data.employee?.name} has been successfully added to {data.employee?.department}.
          </p>
        </div>
      </div>

      <div style={{ display: 'grid', gap: '16px', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))' }}>
        <div style={{ background: cardBg, padding: '16px', borderRadius: '12px', border: `1px solid ${isDark ? 'rgba(255,255,255,0.05)' : 'rgba(255,255,255,0.8)'}` }}>
          <h4 style={{ margin: '0 0 8px 0', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.05em', opacity: 0.6 }}>Employee Profile</h4>
          <div style={{ fontSize: '18px', fontWeight: '600' }}>{data.employee?.name}</div>
          <div style={{ opacity: 0.8, fontSize: '14px' }}>{data.employee?.role} • {data.employee?.id}</div>
        </div>

        <div style={{ background: cardBg, padding: '16px', borderRadius: '12px', border: `1px solid ${isDark ? 'rgba(255,255,255,0.05)' : 'rgba(255,255,255,0.8)'}` }}>
          <h4 style={{ margin: '0 0 8px 0', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.05em', opacity: 0.6 }}>Introductory Meeting</h4>
          <div style={{ fontSize: '16px', fontWeight: '500' }}>{data.meeting ? 'Scheduled' : 'Pending'}</div>
          <div style={{ opacity: 0.8, fontSize: '14px' }}>
            {data.meeting ? `${data.meeting.date} at ${data.meeting.time}` : 'Action required'}
          </div>
        </div>
      </div>

      <div style={{ marginTop: '24px' }}>
        <h3 style={{ fontSize: '16px', marginBottom: '12px', borderBottom: `1px solid ${isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'}`, paddingBottom: '8px' }}>
          Action Summary
        </h3>
        <ul style={{ padding: 0, margin: 0, listStyle: 'none' }}>
          {data.summary.map((step, idx) => (
            <li key={idx} style={{
              padding: '10px 12px',
              margin: '8px 0',
              background: isDark ? 'rgba(0,0,0,0.2)' : 'rgba(255,255,255,0.5)',
              borderRadius: '8px',
              fontSize: '14px',
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              borderLeft: '4px solid #10b981'
            }}>
              {step}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
