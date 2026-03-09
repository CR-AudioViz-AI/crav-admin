/**
 * HENDERSON OVERRIDE PROTOCOL - Deactivate API
 * Deactivate kill switch and resume normal operations
 * 
 * @version 1.0.0
 * @date November 22, 2025 - 10:58 EST
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function POST(request: NextRequest) {
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

    // Parse request body
    const body = await request.json();
    const { reason } = body;

    const deactivateReason = reason || 'Manual deactivation by Roy Henderson';

    // Check if already inactive
    const { data: currentStatus } = await supabase
      .from('javari_settings')
      .select('value')
      .eq('key', 'system_locked')
      .single();

    if (currentStatus?.value === 'false') {
      return NextResponse.json(
        { error: 'Kill switch is already inactive' },
        { status: 409 }
      );
    }

    // Deactivate kill switch using database function
    const { data, error } = await supabase.rpc('deactivate_kill_switch', {
      p_user_id: user.id,
      p_reason: deactivateReason
    });

    if (error) {
      throw error;
    }

    return NextResponse.json({
      success: true,
      message: 'Kill switch deactivated successfully - systems resuming normal operations',
      deactivatedAt: new Date().toISOString(),
      deactivatedBy: user.email,
      reason: deactivateReason
    });

  } catch (error) {
    console.error('Kill switch deactivation error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to deactivate kill switch',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
