-- Live Commerce Module
-- Supports live streaming for sellers and creators with real-time chat,
-- product pinning, live promotions, and direct purchase from stream.

CREATE EXTENSION IF NOT EXISTS pgcrypto; -- enables gen_random_uuid()

-- Live stream sessions
CREATE TABLE IF NOT EXISTS live_streams (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title          VARCHAR(255) NOT NULL,
  description    TEXT,
  streamer_id    UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  store_id       UUID REFERENCES stores(id) ON DELETE SET NULL,
  status         VARCHAR(20) NOT NULL DEFAULT 'scheduled',  -- scheduled, live, ended, cancelled
  stream_key     VARCHAR(100) UNIQUE,
  viewer_count   INTEGER NOT NULL DEFAULT 0,
  thumbnail_url  TEXT,
  scheduled_at   TIMESTAMP WITH TIME ZONE,
  started_at     TIMESTAMP WITH TIME ZONE,
  ended_at       TIMESTAMP WITH TIME ZONE,
  created_at     TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Real-time chat messages within a live stream
CREATE TABLE IF NOT EXISTS live_messages (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  stream_id     UUID NOT NULL REFERENCES live_streams(id) ON DELETE CASCADE,
  user_id       UUID REFERENCES users(id) ON DELETE SET NULL,
  display_name  VARCHAR(100) NOT NULL,
  content       TEXT NOT NULL,
  message_type  VARCHAR(20) NOT NULL DEFAULT 'chat',  -- chat, system, purchase
  created_at    TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Products pinned by the streamer during a live session
CREATE TABLE IF NOT EXISTS live_pinned_products (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  stream_id   UUID NOT NULL REFERENCES live_streams(id) ON DELETE CASCADE,
  product_id  UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  is_active   BOOLEAN NOT NULL DEFAULT TRUE,
  pinned_at   TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  UNIQUE (stream_id, product_id)
);

-- Limited-time promotional offers created during a live stream
CREATE TABLE IF NOT EXISTS live_promotions (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  stream_id        UUID NOT NULL REFERENCES live_streams(id) ON DELETE CASCADE,
  product_id       UUID REFERENCES products(id) ON DELETE SET NULL,
  title            VARCHAR(255) NOT NULL,
  promo_price      NUMERIC(10, 2) NOT NULL,
  original_price   NUMERIC(10, 2),
  discount_percent INTEGER,
  ends_at          TIMESTAMP WITH TIME ZONE NOT NULL,
  max_quantity     INTEGER,
  used_quantity    INTEGER NOT NULL DEFAULT 0,
  is_active        BOOLEAN NOT NULL DEFAULT TRUE,
  created_at       TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Indexes for common query patterns
CREATE INDEX IF NOT EXISTS idx_live_streams_streamer ON live_streams(streamer_id);
CREATE INDEX IF NOT EXISTS idx_live_streams_status   ON live_streams(status);
CREATE INDEX IF NOT EXISTS idx_live_messages_stream  ON live_messages(stream_id, created_at);
CREATE INDEX IF NOT EXISTS idx_live_pinned_stream    ON live_pinned_products(stream_id);
CREATE INDEX IF NOT EXISTS idx_live_promotions_stream ON live_promotions(stream_id);
