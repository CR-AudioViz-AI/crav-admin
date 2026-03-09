/**
 * HENDERSON OVERRIDE PROTOCOL - Logs API
 * Get kill switch activity logs
 * 
 * @version 1.0.0
 * @date November 22, 2025 - 10:56 EST
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  try {
    const supabase = createClient();
    
    // Verify user is Roy
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Get Roy's user ID from settings
    const { data: royIdData } = await supabase
      .from('javari_settings')
      .select('value')
      .eq('key', 'roy_user_id')
      .single();

    if (user.id !== royIdData?.value) {
      return NextResponse.json(
        { error: 'Forbidden - Roy Henderson only' },
        { status: 403 }
      );
    }

    // Get recent logs (last 50)
    const { data: logs, error: logsError } = await supabase
      .from('kill_switch_log')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(50);

    if (logsError) {
      throw logsError;
    }

    // Format logs for frontend
    const formattedLogs = logs.map(log => ({
      id: log.id,
      timestamp: log.created_at,
      action: log.action,
      user: log.user_email || 'System',
      reason: log.reason,
      details: log.details ? JSON.stringify(log.details) : null
    }));

    return NextResponse.json({
      logs: formattedLogs,
      total: logs.length
    });

  } catch (error) {
    console.error('Kill switch logs error:', error);
    return NextResponse.json(
      { error: 'Failed to retrieve logs' },
      { status: 500 }
    );
  }
}
