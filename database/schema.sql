-- SolarShare database schema (PostgreSQL)

CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    password_hash TEXT NOT NULL,
    role TEXT NOT NULL CHECK (role IN ('seller', 'buyer')),
    community_priority BOOLEAN NOT NULL DEFAULT FALSE,
    location TEXT,
    is_admin BOOLEAN NOT NULL DEFAULT FALSE,
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

CREATE TABLE messages (
    id SERIAL PRIMARY KEY,
    request_id INTEGER NOT NULL REFERENCES requests(id) ON DELETE CASCADE,
    sender_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    body TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE vendors (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    location TEXT,
    upi_id TEXT NOT NULL,
    payee_name TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE panels (
    id SERIAL PRIMARY KEY,
    vendor_id INTEGER NOT NULL REFERENCES vendors(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    panel_type TEXT NOT NULL CHECK (panel_type IN ('Monocrystalline', 'Polycrystalline', 'Thin-Film')),
    wattage INTEGER NOT NULL CHECK (wattage > 0),
    price NUMERIC(10, 2) NOT NULL CHECK (price >= 0),
    description TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE panel_orders (
    id SERIAL PRIMARY KEY,
    panel_id INTEGER NOT NULL REFERENCES panels(id) ON DELETE CASCADE,
    buyer_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    quantity INTEGER NOT NULL CHECK (quantity > 0),
    total_amount NUMERIC(10, 2) NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'payment_claimed')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    paid_claimed_at TIMESTAMPTZ
);

CREATE INDEX idx_panels_vendor ON panels(vendor_id);
CREATE INDEX idx_panel_orders_buyer ON panel_orders(buyer_id);
CREATE INDEX idx_listings_seller ON listings(seller_id);
CREATE INDEX idx_listings_status ON listings(status);
CREATE INDEX idx_requests_listing ON requests(listing_id);
CREATE INDEX idx_requests_buyer ON requests(buyer_id);
CREATE INDEX idx_requests_status ON requests(status);
CREATE INDEX idx_messages_request ON messages(request_id);
