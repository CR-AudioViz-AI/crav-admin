-- CR AudioViz AI - Admin Database Functions
-- These functions power the admin dashboard with REAL data
-- No mock data - everything comes from actual database

-- ============================================
-- ANALYTICS SUMMARY
-- ============================================

CREATE OR REPLACE FUNCTION get_analytics_summary()
RETURNS JSON AS $$
DECLARE
  result JSON;
BEGIN
  SELECT json_build_object(
    'total_users', (SELECT COUNT(*) FROM users),
    'active_users_today', (
      SELECT COUNT(*) FROM users 
      WHERE last_sign_in_at >= CURRENT_DATE
    ),
    'active_users_week', (
      SELECT COUNT(*) FROM users 
      WHERE last_sign_in_at >= CURRENT_DATE - INTERVAL '7 days'
    ),
    'active_users_month', (
      SELECT COUNT(*) FROM users 
      WHERE last_sign_in_at >= CURRENT_DATE - INTERVAL '30 days'
    ),
    'total_revenue', (
      SELECT COALESCE(SUM(amount), 0) FROM payments 
      WHERE status = 'succeeded'
    ),
    'mrr', (
      SELECT COALESCE(SUM(
        CASE 
          WHEN plan = 'pro' THEN 29
          WHEN plan = 'business' THEN 99
          WHEN plan = 'enterprise' THEN 299
          ELSE 0
        END
      ), 0) FROM subscriptions 
      WHERE status = 'active'
    ),
    'arr', (
      SELECT COALESCE(SUM(
        CASE 
          WHEN plan = 'pro' THEN 29 * 12
          WHEN plan = 'business' THEN 99 * 12
          WHEN plan = 'enterprise' THEN 299 * 12
          ELSE 0
        END
      ), 0) FROM subscriptions 
      WHERE status = 'active'
    ),
    'total_credits_used', (
      SELECT COALESCE(SUM(ABS(amount)), 0) FROM credit_transactions 
      WHERE type = 'usage'
    ),
    'total_subscriptions', (
      SELECT COUNT(*) FROM subscriptions 
      WHERE status = 'active'
    ),
    'churn_rate', (
      SELECT ROUND(
        COALESCE(
          (SELECT COUNT(*)::DECIMAL FROM subscriptions 
           WHERE status = 'canceled' 
           AND updated_at >= CURRENT_DATE - INTERVAL '30 days')
          /
          NULLIF((SELECT COUNT(*) FROM subscriptions 
                  WHERE created_at < CURRENT_DATE - INTERVAL '30 days'), 0)
          * 100
        , 0)
      , 2)
    )
  ) INTO result;
  
  RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- REVENUE BY PERIOD
-- ============================================

CREATE OR REPLACE FUNCTION get_revenue_by_period(p_period TEXT DEFAULT '30d')
RETURNS TABLE (
  date DATE,
  revenue DECIMAL,
  transactions BIGINT
) AS $$
DECLARE
  interval_value INTERVAL;
BEGIN
  interval_value := CASE p_period
    WHEN '7d' THEN INTERVAL '7 days'
    WHEN '30d' THEN INTERVAL '30 days'
    WHEN '90d' THEN INTERVAL '90 days'
    WHEN '1y' THEN INTERVAL '1 year'
    ELSE INTERVAL '30 days'
  END;

  RETURN QUERY
  SELECT 
    DATE(p.created_at) as date,
    COALESCE(SUM(p.amount), 0) as revenue,
    COUNT(*) as transactions
  FROM payments p
  WHERE p.status = 'succeeded'
    AND p.created_at >= CURRENT_DATE - interval_value
  GROUP BY DATE(p.created_at)
  ORDER BY DATE(p.created_at);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- USER GROWTH BY PERIOD
-- ============================================

CREATE OR REPLACE FUNCTION get_user_growth_by_period(p_period TEXT DEFAULT '30d')
RETURNS TABLE (
  date DATE,
  new_users BIGINT,
  cumulative_users BIGINT
) AS $$
DECLARE
  interval_value INTERVAL;
BEGIN
  interval_value := CASE p_period
    WHEN '7d' THEN INTERVAL '7 days'
    WHEN '30d' THEN INTERVAL '30 days'
    WHEN '90d' THEN INTERVAL '90 days'
    WHEN '1y' THEN INTERVAL '1 year'
    ELSE INTERVAL '30 days'
  END;

  RETURN QUERY
  WITH daily_signups AS (
    SELECT 
      DATE(created_at) as signup_date,
      COUNT(*) as daily_count
    FROM users
    WHERE created_at >= CURRENT_DATE - interval_value
    GROUP BY DATE(created_at)
  )
  SELECT 
    signup_date as date,
    daily_count as new_users,
    SUM(daily_count) OVER (ORDER BY signup_date) as cumulative_users
  FROM daily_signups
  ORDER BY signup_date;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- TOTAL REVENUE
-- ============================================

CREATE OR REPLACE FUNCTION get_total_revenue()
RETURNS DECIMAL AS $$
BEGIN
  RETURN COALESCE(
    (SELECT SUM(amount) FROM payments WHERE status = 'succeeded'),
    0
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- CREDIT ADJUSTMENT
-- ============================================

CREATE OR REPLACE FUNCTION adjust_user_credits(
  p_user_id UUID,
  p_amount INTEGER,
  p_type TEXT,
  p_description TEXT
)
RETURNS JSON AS $$
DECLARE
  current_balance INTEGER;
  new_balance INTEGER;
  transaction_id UUID;
BEGIN
  -- Get current balance
  SELECT credits_balance INTO current_balance
  FROM users WHERE id = p_user_id
  FOR UPDATE;
  
  IF current_balance IS NULL THEN
    RAISE EXCEPTION 'User not found';
  END IF;
  
  -- Calculate new balance
  new_balance := current_balance + p_amount;
  
  -- Ensure balance doesn't go negative (except for usage deductions)
  IF new_balance < 0 AND p_type != 'usage' THEN
    RAISE EXCEPTION 'Insufficient credits';
  END IF;
  
  -- Update user balance
  UPDATE users 
  SET credits_balance = new_balance
  WHERE id = p_user_id;
  
  -- Create transaction record
  INSERT INTO credit_transactions (
    user_id, amount, type, description, balance_after
  ) VALUES (
    p_user_id, p_amount, p_type, p_description, new_balance
  ) RETURNING id INTO transaction_id;
  
  RETURN json_build_object(
    'success', true,
    'transaction_id', transaction_id,
    'previous_balance', current_balance,
    'new_balance', new_balance
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- SUBSCRIPTION METRICS
-- ============================================

CREATE OR REPLACE FUNCTION get_subscription_metrics()
RETURNS JSON AS $$
BEGIN
  RETURN json_build_object(
    'total_active', (
      SELECT COUNT(*) FROM subscriptions WHERE status = 'active'
    ),
    'by_plan', (
      SELECT json_agg(row_to_json(t))
      FROM (
        SELECT plan, COUNT(*) as count
        FROM subscriptions
        WHERE status = 'active'
        GROUP BY plan
        ORDER BY count DESC
      ) t
    ),
    'new_this_month', (
      SELECT COUNT(*) FROM subscriptions
      WHERE created_at >= DATE_TRUNC('month', CURRENT_DATE)
    ),
    'churned_this_month', (
      SELECT COUNT(*) FROM subscriptions
      WHERE status = 'canceled'
      AND updated_at >= DATE_TRUNC('month', CURRENT_DATE)
    ),
    'trial_conversions', (
      SELECT COUNT(*) FROM subscriptions
      WHERE status = 'active'
      AND metadata->>'converted_from_trial' = 'true'
      AND updated_at >= DATE_TRUNC('month', CURRENT_DATE)
    )
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- TOP USERS BY CREDITS USED
-- ============================================

CREATE OR REPLACE FUNCTION get_top_credit_users(p_limit INTEGER DEFAULT 10)
RETURNS TABLE (
  user_id UUID,
  email TEXT,
  full_name TEXT,
  total_used BIGINT,
  current_balance INTEGER
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    u.id as user_id,
    u.email,
    u.full_name,
    COALESCE(SUM(ABS(ct.amount)) FILTER (WHERE ct.type = 'usage'), 0) as total_used,
    u.credits_balance as current_balance
  FROM users u
  LEFT JOIN credit_transactions ct ON u.id = ct.user_id
  GROUP BY u.id, u.email, u.full_name, u.credits_balance
  ORDER BY total_used DESC
  LIMIT p_limit;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- GEOGRAPHIC DISTRIBUTION
-- ============================================

CREATE OR REPLACE FUNCTION get_user_geographic_distribution()
RETURNS TABLE (
  country TEXT,
  user_count BIGINT,
  percentage DECIMAL
) AS $$
DECLARE
  total_users BIGINT;
BEGIN
  SELECT COUNT(*) INTO total_users FROM users;
  
  RETURN QUERY
  SELECT 
    COALESCE(u.metadata->>'country', 'Unknown') as country,
    COUNT(*) as user_count,
    ROUND((COUNT(*)::DECIMAL / total_users) * 100, 2) as percentage
  FROM users u
  GROUP BY u.metadata->>'country'
  ORDER BY user_count DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- RETENTION COHORT ANALYSIS
-- ============================================

CREATE OR REPLACE FUNCTION get_retention_cohorts()
RETURNS TABLE (
  cohort_month DATE,
  month_0 BIGINT,
  month_1 BIGINT,
  month_2 BIGINT,
  month_3 BIGINT,
  month_4 BIGINT,
  month_5 BIGINT,
  month_6 BIGINT
) AS $$
BEGIN
  RETURN QUERY
  WITH cohorts AS (
    SELECT 
      DATE_TRUNC('month', created_at)::DATE as cohort_month,
      id as user_id
    FROM users
    WHERE created_at >= CURRENT_DATE - INTERVAL '7 months'
  ),
  activity AS (
    SELECT 
      user_id,
      DATE_TRUNC('month', created_at)::DATE as activity_month
    FROM activity_log
    GROUP BY user_id, DATE_TRUNC('month', created_at)::DATE
  )
  SELECT 
    c.cohort_month,
    COUNT(DISTINCT c.user_id) as month_0,
    COUNT(DISTINCT CASE WHEN a.activity_month = c.cohort_month + INTERVAL '1 month' THEN c.user_id END) as month_1,
    COUNT(DISTINCT CASE WHEN a.activity_month = c.cohort_month + INTERVAL '2 months' THEN c.user_id END) as month_2,
    COUNT(DISTINCT CASE WHEN a.activity_month = c.cohort_month + INTERVAL '3 months' THEN c.user_id END) as month_3,
    COUNT(DISTINCT CASE WHEN a.activity_month = c.cohort_month + INTERVAL '4 months' THEN c.user_id END) as month_4,
    COUNT(DISTINCT CASE WHEN a.activity_month = c.cohort_month + INTERVAL '5 months' THEN c.user_id END) as month_5,
    COUNT(DISTINCT CASE WHEN a.activity_month = c.cohort_month + INTERVAL '6 months' THEN c.user_id END) as month_6
  FROM cohorts c
  LEFT JOIN activity a ON c.user_id = a.user_id
  GROUP BY c.cohort_month
  ORDER BY c.cohort_month;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- GRANT PERMISSIONS
-- ============================================

-- Grant execute permissions to authenticated users with admin role
-- (Implement RLS policies as needed)

GRANT EXECUTE ON FUNCTION get_analytics_summary() TO authenticated;
GRANT EXECUTE ON FUNCTION get_revenue_by_period(TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION get_user_growth_by_period(TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION get_total_revenue() TO authenticated;
GRANT EXECUTE ON FUNCTION adjust_user_credits(UUID, INTEGER, TEXT, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION get_subscription_metrics() TO authenticated;
GRANT EXECUTE ON FUNCTION get_top_credit_users(INTEGER) TO authenticated;
GRANT EXECUTE ON FUNCTION get_user_geographic_distribution() TO authenticated;
GRANT EXECUTE ON FUNCTION get_retention_cohorts() TO authenticated;
