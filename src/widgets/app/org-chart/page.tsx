'use client';

import React from 'react';
import { useTheme, useWidgetSDK } from '@nitrostack/widgets';

interface EmployeeNode {
  id: string;
  name: string;
  role: string;
  department: string;
  directReports: EmployeeNode[];
}

interface OrgChartData {
  success: boolean;
  chart: EmployeeNode[];
}

export default function OrgChartWidget() {
  const theme = useTheme();
  const { getToolOutput } = useWidgetSDK();
  const data = getToolOutput<OrgChartData>();

  if (!data) {
    return (
      <div style={{ padding: '24px', textAlign: 'center', color: theme === 'dark' ? '#fff' : '#000' }}>
        Loading Organization Chart...
      </div>
    );
  }

  const isDark = theme === 'dark';
  const bgColor = isDark ? '#0f172a' : '#f8fafc';
  const textColor = isDark ? '#f1f5f9' : '#0f172a';
  
  const getDeptColor = (dept: string) => {
    switch (dept.toLowerCase()) {
      case 'engineering': return isDark ? '#1e3a8a' : '#dbeafe';
      case 'hr': return isDark ? '#831843' : '#fce7f3';
      case 'marketing': return isDark ? '#14532d' : '#dcfce7';
      case 'product': return isDark ? '#701a75' : '#fae8ff';
      default: return isDark ? '#334155' : '#f1f5f9';
    }
  };

  const getDeptTextColor = (dept: string) => {
    switch (dept.toLowerCase()) {
      case 'engineering': return isDark ? '#bfdbfe' : '#1e3a8a';
      case 'hr': return isDark ? '#fbcfe8' : '#831843';
      case 'marketing': return isDark ? '#bbf7d0' : '#14532d';
      case 'product': return isDark ? '#f5d0fe' : '#701a75';
      default: return isDark ? '#e2e8f0' : '#334155';
    }
  };

  // Recursive component for rendering the tree
  const TreeNode = ({ node, level = 0 }: { node: EmployeeNode; level?: number }) => {
    return (
      <div style={{
        position: 'relative',
        paddingLeft: level > 0 ? '24px' : '0',
        marginTop: level > 0 ? '16px' : '0'
      }}>
        {level > 0 && (
          <div style={{
            position: 'absolute',
            left: 0,
            top: '-16px',
            bottom: '24px',
            width: '2px',
            background: isDark ? '#334155' : '#cbd5e1',
          }} />
        )}
        {level > 0 && (
          <div style={{
            position: 'absolute',
            left: 0,
            top: '24px',
            width: '24px',
            height: '2px',
            background: isDark ? '#334155' : '#cbd5e1',
          }} />
        )}
        
        <div style={{
          background: isDark ? '#1e293b' : '#ffffff',
          border: `1px solid ${isDark ? '#334155' : '#e2e8f0'}`,
          borderRadius: '12px',
          padding: '16px',
          display: 'inline-block',
          minWidth: '240px',
          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
          position: 'relative',
          zIndex: 1,
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
            <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 'bold' }}>{node.name}</h3>
            <span style={{ fontSize: '12px', color: '#64748b', fontWeight: '600' }}>{node.id}</span>
          </div>
          <div style={{ fontSize: '14px', opacity: 0.8, marginBottom: '12px' }}>{node.role}</div>
          <span style={{ 
            fontSize: '11px', 
            background: getDeptColor(node.department), 
            color: getDeptTextColor(node.department),
            padding: '4px 8px', 
            borderRadius: '16px',
            fontWeight: '600'
          }}>
            {node.department}
          </span>
        </div>
        
        {node.directReports.length > 0 && (
          <div style={{ marginTop: '16px' }}>
            {node.directReports.map((report, idx) => (
              <TreeNode key={idx} node={report} level={level + 1} />
            ))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div style={{
      padding: '32px',
      background: bgColor,
      borderRadius: '16px',
      color: textColor,
      fontFamily: 'system-ui, -apple-system, sans-serif',
      width: '100%',
      overflowX: 'auto',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', marginBottom: '32px', gap: '12px' }}>
        <div style={{ fontSize: '28px' }}>🏢</div>
        <h2 style={{ margin: 0, fontSize: '24px', fontWeight: 'bold', letterSpacing: '-0.02em' }}>Organization Chart</h2>
      </div>

      <div style={{ display: 'flex', gap: '48px' }}>
        {data.chart.map((rootNode, idx) => (
          <TreeNode key={idx} node={rootNode} />
        ))}
      </div>
    </div>
  );
}
