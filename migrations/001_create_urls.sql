create sequence if not exists url_id_seq start with 100000 increment by 1;

create table if not exists urls(
    id bigint primary key default nextval('url_id_seq'),
    short_code varchar(10) unique not null,
    original_url text not null,
    created_at timestamp with time zone default CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_urls_short_code ON urls(short_code);


