import { neon } from '@neondatabase/serverless';

const sql = neon(process.env.DATABASE_URL!);

// Token costs per 1K tokens (GPT-4o pricing)
const TOKEN_COSTS = {
  input: 0.0025,  // $2.50 per 1M input
  output: 0.01    // $10 per 1M output
};

const TIER_LIMITS = {
  free: { dailyTokens: 50000, dailyRequests: 100 },
  pro: { dailyTokens: 500000, dailyRequests: 1000 },
  enterprise: { dailyTokens: 5000000, dailyRequests: 10000 }
};

export interface UsageResult {
  allowed: boolean;
  reason?: string;
  remaining?: { tokens: number; requests: number };
}

export async function checkRateLimit(userId: number): Promise<UsageResult> {
  const today = new Date().toISOString().split('T')[0];
  
  // Get user tier
  const tierResult = await sql`
    SELECT tier FROM user_limits WHERE user_id = ${userId}
  `;
  const tier = (tierResult[0]?.tier || 'free') as keyof typeof TIER_LIMITS;
  const limits = TIER_LIMITS[tier];

  // Get today's usage
  const usageResult = await sql`
    SELECT total_tokens, request_count FROM daily_usage 
    WHERE user_id = ${userId} AND date = ${today}
  `;
  
  const currentTokens = usageResult[0]?.total_tokens || 0;
  const currentRequests = usageResult[0]?.request_count || 0;

  if (currentRequests >= limits.dailyRequests) {
    return { allowed: false, reason: 'Daily request limit reached. Upgrade for more.' };
  }
  if (currentTokens >= limits.dailyTokens) {
    return { allowed: false, reason: 'Daily token limit reached. Upgrade for more.' };
  }

  return {
    allowed: true,
    remaining: {
      tokens: limits.dailyTokens - currentTokens,
      requests: limits.dailyRequests - currentRequests
    }
  };
}

export async function trackUsage(
  userId: number,
  endpoint: string,
  inputTokens: number,
  outputTokens: number
): Promise<void> {
  const totalTokens = inputTokens + outputTokens;
  const cost = (inputTokens / 1000) * TOKEN_COSTS.input + (outputTokens / 1000) * TOKEN_COSTS.output;
  const today = new Date().toISOString().split('T')[0];

  // Record individual usage
  await sql`
    INSERT INTO token_usage (user_id, endpoint, tokens_used, cost_usd)
    VALUES (${userId}, ${endpoint}, ${totalTokens}, ${cost})
  `;

  // Update daily aggregate
  await sql`
    INSERT INTO daily_usage (user_id, date, total_tokens, total_cost_usd, request_count)
    VALUES (${userId}, ${today}, ${totalTokens}, ${cost}, 1)
    ON CONFLICT (user_id, date) 
    DO UPDATE SET 
      total_tokens = daily_usage.total_tokens + ${totalTokens},
      total_cost_usd = daily_usage.total_cost_usd + ${cost},
      request_count = daily_usage.request_count + 1
  `;
}

export async function getUserUsageStats(userId: number): Promise<{
  today: { tokens: number; requests: number; cost: number };
  tier: string;
  limits: { dailyTokens: number; dailyRequests: number };
}> {
  const today = new Date().toISOString().split('T')[0];
  
  const [usage, tierResult] = await Promise.all([
    sql`SELECT total_tokens, request_count, total_cost_usd FROM daily_usage WHERE user_id = ${userId} AND date = ${today}`,
    sql`SELECT tier FROM user_limits WHERE user_id = ${userId}`
  ]);

  const tier = (tierResult[0]?.tier || 'free') as keyof typeof TIER_LIMITS;
  
  return {
    today: {
      tokens: usage[0]?.total_tokens || 0,
      requests: usage[0]?.request_count || 0,
      cost: parseFloat(usage[0]?.total_cost_usd || '0')
    },
    tier,
    limits: TIER_LIMITS[tier]
  };
}

// Estimate tokens from text (rough approximation)
export function estimateTokens(text: string): number {
  return Math.ceil(text.length / 4);
}
