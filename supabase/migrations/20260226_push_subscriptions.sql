-- Migration: Web Push Subscriptions
-- Table to store user Push API subscriptions for web notifications.

CREATE TABLE IF NOT EXISTS push_subscriptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    subscription_data JSONB NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now(),
    -- Ensure a user only has one active subscription per endpoint (or just unique globally)
    UNIQUE(user_id, subscription_data->>'endpoint')
);

-- Note: We extract the endpoint directly from the JSON to prevent the exact same 
-- browser subscribing twice for the same user.

-- Enable RLS
ALTER TABLE push_subscriptions ENABLE ROW LEVEL SECURITY;

-- Users can insert and read their own subscriptions
CREATE POLICY "Users can manage own subscriptions" ON push_subscriptions
    FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Admins / Service Role can read all subscriptions for pushing notifications
CREATE POLICY "Service role full access" ON push_subscriptions
    FOR ALL USING (true) WITH CHECK (true);
