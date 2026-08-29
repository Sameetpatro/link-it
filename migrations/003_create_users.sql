CREATE TABLE IF NOT EXISTS users (
    id BIGSERIAL PRIMARY KEY,
    username VARCHAR(64) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(20) DEFAULT 'user',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='urls' AND column_name='user_id') THEN
        ALTER TABLE urls ADD COLUMN user_id BIGINT REFERENCES users(id) ON DELETE SET NULL;
        CREATE INDEX idx_urls_user_id ON urls(user_id);
    END IF;
END $$;