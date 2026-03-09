/**
 * HENDERSON OVERRIDE PROTOCOL - Activate API
 * Activate kill switch and freeze all systems
 * 
 * @version 1.0.0
 * @date November 22, 2025 - 10:57 EST
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

    if (!reason || typeof reason !== 'string' || reason.trim().length === 0) {
      return NextResponse.json(
        { error: 'Reason is required' },
        { status: 400 }
      );
    }

    // Check if already active
    const { data: currentStatus } = await supabase
      .from('javari_settings')
      .select('value')
      .eq('key', 'system_locked')
      .single();

    if (currentStatus?.value === 'true') {
      return NextResponse.json(
        { error: 'Kill switch is already active' },
        { status: 409 }
      );
    }

    // Activate kill switch using database function
    const { data, error } = await supabase.rpc('activate_kill_switch', {
      p_user_id: user.id,
      p_reason: reason.trim()
    });

    if (error) {
      throw error;
    }

    return NextResponse.json({
      success: true,
      message: 'Kill switch activated successfully',
      activatedAt: new Date().toISOString(),
      activatedBy: user.email,
      reason: reason.trim()
    });

  } catch (error) {
    console.error('Kill switch activation error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to activate kill switch',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
