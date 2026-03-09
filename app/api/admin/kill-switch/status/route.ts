/**
 * HENDERSON OVERRIDE PROTOCOL - Status API
 * Get current kill switch status
 * 
 * @version 1.0.0
 * @date November 22, 2025 - 10:55 EST
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

    // Get kill switch status
    const { data: statusData } = await supabase
      .from('javari_settings')
      .select('value, updated_at, updated_by')
      .eq('key', 'system_locked')
      .single();

    const active = statusData?.value === 'true';

    // If active, get activation details
    let activationDetails = null;
    if (active) {
      const { data: logData } = await supabase
        .from('kill_switch_log')
        .select('*')
        .eq('action', 'ACTIVATED')
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (logData) {
        activationDetails = {
          activatedAt: logData.created_at,
          activatedBy: logData.user_email,
          reason: logData.reason
        };
      }
    }

    // Define affected systems
    const affectedSystems = active ? [
      'Javari AI Chat',
      'Auto-Healing System',
      'Auto-Build System',
      'Project Management',
      'Telemetry Collection',
      'Developer Commit API',
      'Developer Deploy API',
      'Code Generation',
      'Auto-Fix System',
      'Suggestions Engine',
      'Code Review System'
    ] : [];

    return NextResponse.json({
      active,
      activatedAt: activationDetails?.activatedAt || null,
      activatedBy: activationDetails?.activatedBy || null,
      reason: activationDetails?.reason || null,
      affectedSystems,
      lastChecked: new Date().toISOString()
    });

  } catch (error) {
    console.error('Kill switch status error:', error);
    return NextResponse.json(
      { error: 'Failed to retrieve status' },
      { status: 500 }
    );
  }
}
