'use client';

import React from 'react';
import { useTheme, useWidgetSDK } from '@nitrostack/widgets';

interface Ticket {
  id: string;
  employeeId: string;
  item: string;
  priority: string;
  status: 'Open' | 'In Progress' | 'Resolved' | 'Closed';
  notes: string;
}

interface TicketData {
  success: boolean;
  totalTickets: number;
  tickets: Ticket[];
}

export default function TicketBoardWidget() {
  const theme = useTheme();
  const { getToolOutput } = useWidgetSDK();
  const data = getToolOutput<TicketData>();

  if (!data) {
    return (
      <div style={{ padding: '24px', textAlign: 'center', color: theme === 'dark' ? '#fff' : '#000' }}>
        Loading Ticket Board...
      </div>
    );
  }

  const isDark = theme === 'dark';
  const bgColor = isDark ? '#111827' : '#f3f4f6';
  const textColor = isDark ? '#f9fafb' : '#111827';
  const columnBg = isDark ? '#1f2937' : '#e5e7eb';
  const cardBg = isDark ? '#374151' : '#ffffff';

  const statuses: Ticket['status'][] = ['Open', 'In Progress', 'Resolved', 'Closed'];

  const getPriorityColor = (priority: string) => {
    switch (priority.toLowerCase()) {
      case 'urgent': return '#ef4444';
      case 'high': return '#f59e0b';
      case 'medium': return '#3b82f6';
      case 'low': return '#10b981';
      default: return '#6b7280';
    }
  };

  return (
    <div style={{
      padding: '24px',
      background: bgColor,
      borderRadius: '12px',
      color: textColor,
      fontFamily: 'system-ui, -apple-system, sans-serif',
      width: '100%',
      minWidth: '600px',
      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <h2 style={{ margin: 0, fontSize: '20px', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '8px' }}>
          🎫 IT Ticket Board
        </h2>
        <span style={{ background: isDark ? '#374151' : '#d1d5db', padding: '4px 12px', borderRadius: '16px', fontSize: '14px', fontWeight: '500' }}>
          {data.totalTickets} Tickets
        </span>
      </div>

      <div style={{ display: 'flex', gap: '16px', overflowX: 'auto', paddingBottom: '8px' }}>
        {statuses.map(status => {
          const columnTickets = data.tickets.filter(t => t.status === status);
          
          return (
            <div key={status} style={{
              flex: '1 1 250px',
              minWidth: '220px',
              background: columnBg,
              borderRadius: '8px',
              padding: '16px',
              display: 'flex',
              flexDirection: 'column',
              gap: '12px'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h3 style={{ margin: 0, fontSize: '14px', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.05em', opacity: 0.8 }}>
                  {status}
                </h3>
                <span style={{ fontSize: '12px', background: isDark ? '#111827' : '#d1d5db', padding: '2px 8px', borderRadius: '12px' }}>
                  {columnTickets.length}
                </span>
              </div>

              {columnTickets.map(ticket => (
                <div key={ticket.id} style={{
                  background: cardBg,
                  borderRadius: '6px',
                  padding: '12px',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                  borderLeft: `4px solid ${getPriorityColor(ticket.priority)}`,
                  transition: 'transform 0.2s, box-shadow 0.2s',
                  cursor: 'default',
                }}
                onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 4px 6px rgba(0,0,0,0.1)'; }}
                onMouseLeave={(e) => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.1)'; }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                    <span style={{ fontSize: '12px', fontWeight: '600', color: '#6b7280' }}>{ticket.id}</span>
                    <span style={{ 
                      fontSize: '10px', 
                      textTransform: 'uppercase', 
                      fontWeight: 'bold', 
                      color: getPriorityColor(ticket.priority),
                      background: `${getPriorityColor(ticket.priority)}22`,
                      padding: '2px 6px',
                      borderRadius: '4px'
                    }}>
                      {ticket.priority}
                    </span>
                  </div>
                  <h4 style={{ margin: '0 0 4px 0', fontSize: '14px', fontWeight: '600' }}>{ticket.item}</h4>
                  <div style={{ fontSize: '12px', opacity: 0.7, marginBottom: '8px' }}>
                    Requested by: <strong>{ticket.employeeId}</strong>
                  </div>
                  {ticket.notes && (
                    <div style={{ 
                      fontSize: '11px', 
                      opacity: 0.6, 
                      whiteSpace: 'nowrap', 
                      overflow: 'hidden', 
                      textOverflow: 'ellipsis',
                      background: isDark ? 'rgba(0,0,0,0.2)' : 'rgba(0,0,0,0.05)',
                      padding: '4px 6px',
                      borderRadius: '4px'
                    }}>
                      {ticket.notes}
                    </div>
                  )}
                </div>
              ))}
              
              {columnTickets.length === 0 && (
                <div style={{ 
                  textAlign: 'center', 
                  padding: '20px 0', 
                  fontSize: '13px', 
                  opacity: 0.5,
                  border: `1px dashed ${isDark ? '#4b5563' : '#9ca3af'}`,
                  borderRadius: '6px'
                }}>
                  No tickets
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
