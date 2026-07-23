-- SolarShare database schema (PostgreSQL)

CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    password_hash TEXT NOT NULL,
    role TEXT NOT NULL CHECK (role IN ('seller', 'buyer')),
    community_priority BOOLEAN NOT NULL DEFAULT FALSE,
    location TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE listings (
    id SERIAL PRIMARY KEY,
    seller_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    kwh_available NUMERIC(10, 2) NOT NULL CHECK (kwh_available > 0),
    standard_price NUMERIC(10, 2) NOT NULL CHECK (standard_price >= 0),
    community_price NUMERIC(10, 2) CHECK (community_price IS NULL OR community_price >= 0),
    location TEXT NOT NULL,
    available_from TIMESTAMPTZ NOT NULL,
    available_to TIMESTAMPTZ NOT NULL,
    status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'closed')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE requests (
    id SERIAL PRIMARY KEY,
    listing_id INTEGER NOT NULL REFERENCES listings(id) ON DELETE CASCADE,
    buyer_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    kwh_requested NUMERIC(10, 2) NOT NULL CHECK (kwh_requested > 0),
    price_applied NUMERIC(10, 2) NOT NULL,
    is_priority BOOLEAN NOT NULL DEFAULT FALSE,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'declined')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    responded_at TIMESTAMPTZ
);

CREATE INDEX idx_listings_seller ON listings(seller_id);
CREATE INDEX idx_listings_status ON listings(status);
CREATE INDEX idx_requests_listing ON requests(listing_id);
CREATE INDEX idx_requests_buyer ON requests(buyer_id);
CREATE INDEX idx_requests_status ON requests(status);
