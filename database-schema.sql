-- ═══════════════════════════════════════════════════════════════════════════
--  ApeTable — Supabase PostgreSQL Schema
--  Versione: 1.0
--
--  ISTRUZIONI:
--  1. Apri Supabase → SQL Editor
--  2. Incolla e lancia questo file intero (Run All)
--  3. Le policy RLS proteggono i dati automaticamente
--
--  ORDINE DI ESECUZIONE:
--  Extensions → Enums → Tables → Indexes → Functions → Triggers → RLS → Policies → Seed
-- ═══════════════════════════════════════════════════════════════════════════


-- ── EXTENSIONS ──────────────────────────────────────────────────────────────
-- uuid_generate_v4() per le chiavi primarie
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";


-- ── ENUMS ───────────────────────────────────────────────────────────────────
CREATE TYPE user_role       AS ENUM ('cliente', 'commerciante');
CREATE TYPE price_range     AS ENUM ('€', '€€', '€€€', '€€€€');
CREATE TYPE booking_status  AS ENUM ('pending', 'confirmed', 'cancelled', 'no_show');
CREATE TYPE payment_status  AS ENUM ('not_required', 'pending', 'paid', 'refunded', 'failed');
CREATE TYPE day_of_week     AS ENUM ('lun', 'mar', 'mer', 'gio', 'ven', 'sab', 'dom');


-- ═══════════════════════════════════════════════════════════════════════════
--  1. PROFILES (estende auth.users di Supabase)
-- ═══════════════════════════════════════════════════════════════════════════
CREATE TABLE public.profiles (
  id           UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name         TEXT        NOT NULL,
  phone        TEXT,
  avatar_url   TEXT,
  role         user_role   NOT NULL DEFAULT 'cliente',
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE public.profiles IS
  'Dati utente pubblici. Estende auth.users. Ogni utente ha esattamente un profilo.';

-- Indici
CREATE INDEX idx_profiles_role ON public.profiles(role);


-- ═══════════════════════════════════════════════════════════════════════════
--  2. RESTAURANTS
-- ═══════════════════════════════════════════════════════════════════════════
CREATE TABLE public.restaurants (
  id               UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
  owner_id         UUID        NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,

  -- Identità
  name             TEXT        NOT NULL,
  slug             TEXT        NOT NULL UNIQUE,           -- usato nelle URL /restaurants/[slug]
  description      TEXT,
  cuisine          TEXT        NOT NULL,                  -- es. 'Spritz Bar', 'Wine Bar'
  tags             TEXT[]      DEFAULT '{}',              -- es. ['aperitivo', 'rooftop']

  -- Posizione
  address          TEXT,
  neighborhood     TEXT,
  city             TEXT        NOT NULL,
  country          TEXT        NOT NULL DEFAULT 'IT',
  lat              NUMERIC(9, 6),
  lng              NUMERIC(9, 6),

  -- Contatti
  phone            TEXT,
  website          TEXT,
  email            TEXT,

  -- Prenotazione
  price_range      price_range NOT NULL DEFAULT '€€',
  deposit_required BOOLEAN     NOT NULL DEFAULT FALSE,
  deposit_amount   NUMERIC(8, 2),                        -- importo caparra in EUR
  max_party_size   INTEGER     NOT NULL DEFAULT 10,
  booking_window_days INTEGER  NOT NULL DEFAULT 30,      -- quanti giorni avanti si può prenotare

  -- Metriche (aggiornate da trigger)
  rating           NUMERIC(3, 2) DEFAULT 0,
  review_count     INTEGER       DEFAULT 0,

  -- Immagine di copertina (URL diretto, in attesa di restaurant_images)
  cover_image_url  TEXT,

  -- Urgency / social proof (gestiti dal commerciante)
  urgency_label    TEXT,                                  -- es. 'Quasi esaurito'
  social_proof     TEXT,                                  -- es. '12 prenotazioni oggi'

  -- Stato
  is_active        BOOLEAN     NOT NULL DEFAULT TRUE,
  is_verified      BOOLEAN     NOT NULL DEFAULT FALSE,    -- verificato dal team ApeTable

  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE public.restaurants IS
  'Locale gestito da un commerciante. Un commerciante può avere più locali.';

-- Indici
CREATE INDEX idx_restaurants_owner    ON public.restaurants(owner_id);
CREATE INDEX idx_restaurants_city     ON public.restaurants(city);
CREATE INDEX idx_restaurants_cuisine  ON public.restaurants(cuisine);
CREATE INDEX idx_restaurants_active   ON public.restaurants(is_active) WHERE is_active = TRUE;
CREATE INDEX idx_restaurants_rating   ON public.restaurants(rating DESC);
-- Ricerca full-text su nome + descrizione
CREATE INDEX idx_restaurants_fts ON public.restaurants
  USING gin(to_tsvector('italian', coalesce(name, '') || ' ' || coalesce(description, '')));


-- ═══════════════════════════════════════════════════════════════════════════
--  3. RESTAURANT_IMAGES
-- ═══════════════════════════════════════════════════════════════════════════
CREATE TABLE public.restaurant_images (
  id             UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
  restaurant_id  UUID        NOT NULL REFERENCES public.restaurants(id) ON DELETE CASCADE,
  url            TEXT        NOT NULL,
  alt            TEXT,
  position       SMALLINT    NOT NULL DEFAULT 0,   -- ordine di visualizzazione (0 = prima)
  is_cover       BOOLEAN     NOT NULL DEFAULT FALSE,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE public.restaurant_images IS
  'Galleria foto del locale. position determina l''ordine. is_cover = immagine hero.';

-- Un solo is_cover = TRUE per locale
CREATE UNIQUE INDEX idx_images_cover ON public.restaurant_images(restaurant_id)
  WHERE is_cover = TRUE;

-- Indici
CREATE INDEX idx_images_restaurant ON public.restaurant_images(restaurant_id, position);


-- ═══════════════════════════════════════════════════════════════════════════
--  4. TABLES (tavoli fisici del locale)
-- ═══════════════════════════════════════════════════════════════════════════
CREATE TABLE public.tables (
  id                   UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
  restaurant_id        UUID        NOT NULL REFERENCES public.restaurants(id) ON DELETE CASCADE,
  name                 TEXT        NOT NULL,          -- es. 'Tavolo 1', 'Bancone', 'Terrazza A'
  capacity_min         SMALLINT    NOT NULL DEFAULT 1,
  capacity_max         SMALLINT    NOT NULL DEFAULT 4,
  location_description TEXT,                         -- es. 'Sala interna', 'Dehor'
  is_outdoor           BOOLEAN     NOT NULL DEFAULT FALSE,
  is_active            BOOLEAN     NOT NULL DEFAULT TRUE,
  notes                TEXT,                         -- note interne del commerciante
  created_at           TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at           TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  CONSTRAINT chk_capacity CHECK (capacity_min <= capacity_max AND capacity_min >= 1)
);

COMMENT ON TABLE public.tables IS
  'Tavoli fisici del locale. Usati per assegnare una prenotazione a un tavolo specifico.';

-- Indici
CREATE INDEX idx_tables_restaurant ON public.tables(restaurant_id);
CREATE INDEX idx_tables_active     ON public.tables(restaurant_id, is_active) WHERE is_active = TRUE;


-- ═══════════════════════════════════════════════════════════════════════════
--  5. AVAILABILITY (slot orari disponibili per le prenotazioni)
--
--  Due livelli:
--  a) availability_schedules — template ricorrenti (es. ogni ven dalle 18 alle 22)
--  b) availability_slots — slot concreti per una data specifica (generati dai template
--     o inseriti manualmente dal commerciante)
-- ═══════════════════════════════════════════════════════════════════════════

-- 5a. Template ricorrenti
CREATE TABLE public.availability_schedules (
  id               UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
  restaurant_id    UUID        NOT NULL REFERENCES public.restaurants(id) ON DELETE CASCADE,
  days_of_week     day_of_week[] NOT NULL,    -- es. '{ven, sab, dom}'
  start_time       TIME        NOT NULL,       -- es. '18:00'
  end_time         TIME        NOT NULL,       -- es. '21:00'
  total_seats      SMALLINT    NOT NULL,       -- posti totali per slot
  slot_duration_min SMALLINT   NOT NULL DEFAULT 30, -- durata slot in minuti
  discount_percent SMALLINT    DEFAULT 0,
  label            TEXT,                       -- es. 'Early bird', 'Happy hour'
  is_active        BOOLEAN     NOT NULL DEFAULT TRUE,
  valid_from       DATE,                       -- dal (null = sempre attivo)
  valid_until      DATE,                       -- al  (null = nessuna scadenza)
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  CONSTRAINT chk_schedule_time  CHECK (start_time < end_time),
  CONSTRAINT chk_discount       CHECK (discount_percent BETWEEN 0 AND 100)
);

-- 5b. Slot concreti (uno per ogni orario prenotabile di una data specifica)
CREATE TABLE public.availability_slots (
  id                UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
  restaurant_id     UUID        NOT NULL REFERENCES public.restaurants(id) ON DELETE CASCADE,
  schedule_id       UUID        REFERENCES public.availability_schedules(id) ON DELETE SET NULL,
  date              DATE        NOT NULL,
  start_time        TIME        NOT NULL,
  end_time          TIME        NOT NULL,
  total_seats       SMALLINT    NOT NULL,
  available_seats   SMALLINT    NOT NULL,    -- decresce ad ogni prenotazione
  discount_percent  SMALLINT    DEFAULT 0,
  label             TEXT,
  is_active         BOOLEAN     NOT NULL DEFAULT TRUE,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  CONSTRAINT chk_slot_time     CHECK (start_time < end_time),
  CONSTRAINT chk_seats         CHECK (available_seats >= 0 AND available_seats <= total_seats),
  CONSTRAINT chk_slot_discount CHECK (discount_percent BETWEEN 0 AND 100),
  UNIQUE (restaurant_id, date, start_time)   -- nessuno slot duplicato per stesso orario
);

COMMENT ON TABLE public.availability_slots IS
  'Slot prenotabili concreti. available_seats si aggiorna ad ogni prenotazione.';

-- Indici (query più frequente: disponibilità per locale + data)
CREATE INDEX idx_slots_restaurant_date ON public.availability_slots(restaurant_id, date);
CREATE INDEX idx_slots_date            ON public.availability_slots(date);
CREATE INDEX idx_slots_active          ON public.availability_slots(restaurant_id, date, is_active)
  WHERE is_active = TRUE;
CREATE INDEX idx_schedules_restaurant  ON public.availability_schedules(restaurant_id);


-- ═══════════════════════════════════════════════════════════════════════════
--  6. BOOKINGS
-- ═══════════════════════════════════════════════════════════════════════════
CREATE TABLE public.bookings (
  id               UUID           PRIMARY KEY DEFAULT uuid_generate_v4(),
  booking_ref      TEXT           NOT NULL UNIQUE,   -- es. APE-2024-00042 (generato da trigger)
  restaurant_id    UUID           NOT NULL REFERENCES public.restaurants(id),
  slot_id          UUID           REFERENCES public.availability_slots(id) ON DELETE SET NULL,
  table_id         UUID           REFERENCES public.tables(id) ON DELETE SET NULL, -- assegnato dal commerciante
  customer_id      UUID           NOT NULL REFERENCES public.profiles(id),

  -- Dettagli prenotazione
  date             DATE           NOT NULL,
  start_time       TIME           NOT NULL,
  guests           SMALLINT       NOT NULL,
  status           booking_status NOT NULL DEFAULT 'pending',

  -- Informazioni cliente (snapshot al momento della prenotazione)
  customer_name    TEXT           NOT NULL,
  customer_email   TEXT           NOT NULL,
  customer_phone   TEXT,
  special_requests TEXT,

  -- Caparra
  deposit_required BOOLEAN        NOT NULL DEFAULT FALSE,
  deposit_amount   NUMERIC(8, 2),

  -- Timestamp
  confirmed_at     TIMESTAMPTZ,
  cancelled_at     TIMESTAMPTZ,
  cancel_reason    TEXT,
  created_at       TIMESTAMPTZ    NOT NULL DEFAULT NOW(),
  updated_at       TIMESTAMPTZ    NOT NULL DEFAULT NOW(),

  CONSTRAINT chk_guests CHECK (guests >= 1 AND guests <= 50)
);

COMMENT ON TABLE public.bookings IS
  'Ogni prenotazione fatta da un cliente. booking_ref è il riferimento human-readable.';

-- Indici
CREATE INDEX idx_bookings_customer    ON public.bookings(customer_id);
CREATE INDEX idx_bookings_restaurant  ON public.bookings(restaurant_id);
CREATE INDEX idx_bookings_date        ON public.bookings(restaurant_id, date);
CREATE INDEX idx_bookings_status      ON public.bookings(status);
CREATE INDEX idx_bookings_slot        ON public.bookings(slot_id);


-- ═══════════════════════════════════════════════════════════════════════════
--  7. PAYMENTS
-- ═══════════════════════════════════════════════════════════════════════════
CREATE TABLE public.payments (
  id                   UUID           PRIMARY KEY DEFAULT uuid_generate_v4(),
  booking_id           UUID           NOT NULL REFERENCES public.bookings(id) ON DELETE RESTRICT,
  customer_id          UUID           NOT NULL REFERENCES public.profiles(id),

  -- Importi
  amount               NUMERIC(10, 2) NOT NULL,
  currency             CHAR(3)        NOT NULL DEFAULT 'EUR',

  -- Stato
  status               payment_status NOT NULL DEFAULT 'pending',

  -- Stripe (o altro provider)
  payment_intent_id    TEXT UNIQUE,               -- Stripe PaymentIntent ID
  payment_method_type  TEXT,                      -- es. 'card', 'sepa_debit'
  payment_method_last4 TEXT,                      -- ultime 4 cifre carta

  -- Rimborso
  refund_id            TEXT,                      -- Stripe Refund ID
  refunded_amount      NUMERIC(10, 2),

  -- Timestamp
  paid_at              TIMESTAMPTZ,
  refunded_at          TIMESTAMPTZ,
  failed_at            TIMESTAMPTZ,
  failure_reason       TEXT,

  -- Metadati extra (webhook Stripe, ecc.)
  metadata             JSONB          DEFAULT '{}',

  created_at           TIMESTAMPTZ    NOT NULL DEFAULT NOW(),
  updated_at           TIMESTAMPTZ    NOT NULL DEFAULT NOW(),

  CONSTRAINT chk_amount         CHECK (amount > 0),
  CONSTRAINT chk_refund_amount  CHECK (refunded_amount IS NULL OR refunded_amount <= amount)
);

COMMENT ON TABLE public.payments IS
  'Pagamenti caparra. Un booking può avere al massimo un pagamento attivo.';

-- Un solo pagamento attivo (non failed/refunded) per prenotazione
CREATE UNIQUE INDEX idx_payments_booking_active ON public.payments(booking_id)
  WHERE status IN ('pending', 'paid');

-- Indici
CREATE INDEX idx_payments_customer       ON public.payments(customer_id);
CREATE INDEX idx_payments_intent         ON public.payments(payment_intent_id);
CREATE INDEX idx_payments_status         ON public.payments(status);


-- ═══════════════════════════════════════════════════════════════════════════
--  8. REVIEWS
-- ═══════════════════════════════════════════════════════════════════════════
CREATE TABLE public.reviews (
  id             UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
  restaurant_id  UUID        NOT NULL REFERENCES public.restaurants(id) ON DELETE CASCADE,
  customer_id    UUID        NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  booking_id     UUID        REFERENCES public.bookings(id) ON DELETE SET NULL,  -- verifica visita

  rating         SMALLINT    NOT NULL,
  body           TEXT,
  is_published   BOOLEAN     NOT NULL DEFAULT TRUE,   -- commerciante può rispondere, non nascondere

  created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  CONSTRAINT chk_rating          CHECK (rating BETWEEN 1 AND 5),
  -- Un cliente può lasciare al massimo una recensione per prenotazione
  UNIQUE (booking_id, customer_id)
);

COMMENT ON TABLE public.reviews IS
  'Recensioni dei clienti. Collegate a una prenotazione per verificare la visita.';

-- Indici
CREATE INDEX idx_reviews_restaurant ON public.reviews(restaurant_id, is_published);
CREATE INDEX idx_reviews_customer   ON public.reviews(customer_id);
CREATE INDEX idx_reviews_rating     ON public.reviews(restaurant_id, rating);


-- ═══════════════════════════════════════════════════════════════════════════
--  9. FAVORITES
-- ═══════════════════════════════════════════════════════════════════════════
CREATE TABLE public.favorites (
  id             UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
  customer_id    UUID        NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  restaurant_id  UUID        NOT NULL REFERENCES public.restaurants(id) ON DELETE CASCADE,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  UNIQUE (customer_id, restaurant_id)   -- no duplicati
);

COMMENT ON TABLE public.favorites IS
  'Locali salvati dal cliente. Toggle: insert = salva, delete = rimuovi.';

-- Indici
CREATE INDEX idx_favorites_customer    ON public.favorites(customer_id);
CREATE INDEX idx_favorites_restaurant  ON public.favorites(restaurant_id);


-- ═══════════════════════════════════════════════════════════════════════════
--  FUNZIONI HELPER
-- ═══════════════════════════════════════════════════════════════════════════

-- Ruolo dell'utente corrente (usato nelle policy RLS per evitare JOIN ripetuti)
CREATE OR REPLACE FUNCTION public.get_my_role()
RETURNS TEXT
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT role::TEXT FROM public.profiles WHERE id = auth.uid();
$$;

-- Genera booking_ref nel formato APE-YYYY-NNNNN
CREATE OR REPLACE FUNCTION public.generate_booking_ref()
RETURNS TEXT
LANGUAGE plpgsql
AS $$
DECLARE
  seq     INTEGER;
  yr      TEXT;
BEGIN
  yr  := TO_CHAR(NOW(), 'YYYY');
  SELECT COALESCE(MAX(CAST(SPLIT_PART(booking_ref, '-', 3) AS INTEGER)), 0) + 1
    INTO seq
    FROM public.bookings
    WHERE booking_ref LIKE 'APE-' || yr || '-%';
  RETURN 'APE-' || yr || '-' || LPAD(seq::TEXT, 5, '0');
END;
$$;

-- Aggiorna updated_at automaticamente
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

-- Aggiorna rating e review_count su restaurants dopo ogni review
CREATE OR REPLACE FUNCTION public.refresh_restaurant_rating()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  rid UUID;
BEGIN
  rid := COALESCE(NEW.restaurant_id, OLD.restaurant_id);
  UPDATE public.restaurants
  SET
    rating       = (SELECT ROUND(AVG(rating)::NUMERIC, 2) FROM public.reviews WHERE restaurant_id = rid AND is_published = TRUE),
    review_count = (SELECT COUNT(*)                        FROM public.reviews WHERE restaurant_id = rid AND is_published = TRUE),
    updated_at   = NOW()
  WHERE id = rid;
  RETURN NULL;
END;
$$;

-- Aggiorna available_seats su availability_slots dopo ogni booking
CREATE OR REPLACE FUNCTION public.update_slot_availability()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Prenotazione creata o confermata: scala i posti
  IF TG_OP = 'INSERT' AND NEW.slot_id IS NOT NULL THEN
    UPDATE public.availability_slots
    SET available_seats = GREATEST(available_seats - NEW.guests, 0),
        updated_at      = NOW()
    WHERE id = NEW.slot_id;

  -- Prenotazione cancellata: restituisci i posti
  ELSIF TG_OP = 'UPDATE'
    AND OLD.status NOT IN ('cancelled', 'no_show')
    AND NEW.status IN ('cancelled', 'no_show')
    AND NEW.slot_id IS NOT NULL
  THEN
    UPDATE public.availability_slots
    SET available_seats = LEAST(available_seats + NEW.guests, total_seats),
        updated_at      = NOW()
    WHERE id = NEW.slot_id;
  END IF;

  RETURN NULL;
END;
$$;


-- ═══════════════════════════════════════════════════════════════════════════
--  TRIGGER
-- ═══════════════════════════════════════════════════════════════════════════

-- updated_at automatico
CREATE TRIGGER trg_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TRIGGER trg_restaurants_updated_at
  BEFORE UPDATE ON public.restaurants
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TRIGGER trg_tables_updated_at
  BEFORE UPDATE ON public.tables
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TRIGGER trg_slots_updated_at
  BEFORE UPDATE ON public.availability_slots
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TRIGGER trg_bookings_updated_at
  BEFORE UPDATE ON public.bookings
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TRIGGER trg_payments_updated_at
  BEFORE UPDATE ON public.payments
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TRIGGER trg_reviews_updated_at
  BEFORE UPDATE ON public.reviews
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- booking_ref auto-generato
CREATE OR REPLACE FUNCTION public.set_booking_ref()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  IF NEW.booking_ref IS NULL OR NEW.booking_ref = '' THEN
    NEW.booking_ref := public.generate_booking_ref();
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_bookings_ref
  BEFORE INSERT ON public.bookings
  FOR EACH ROW EXECUTE FUNCTION public.set_booking_ref();

-- Rating su restaurants
CREATE TRIGGER trg_reviews_rating
  AFTER INSERT OR UPDATE OR DELETE ON public.reviews
  FOR EACH ROW EXECUTE FUNCTION public.refresh_restaurant_rating();

-- Disponibilità slot
CREATE TRIGGER trg_bookings_availability
  AFTER INSERT OR UPDATE OF status ON public.bookings
  FOR EACH ROW EXECUTE FUNCTION public.update_slot_availability();

-- Profilo automatico alla registrazione
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, name, role)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1)),
    COALESCE((NEW.raw_user_meta_data->>'role')::user_role, 'cliente')
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();


-- ═══════════════════════════════════════════════════════════════════════════
--  ROW LEVEL SECURITY (RLS)
-- ═══════════════════════════════════════════════════════════════════════════

ALTER TABLE public.profiles           ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.restaurants        ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.restaurant_images  ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tables             ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.availability_schedules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.availability_slots ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bookings           ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments           ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reviews            ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.favorites          ENABLE ROW LEVEL SECURITY;


-- ═══════════════════════════════════════════════════════════════════════════
--  POLICY: profiles
-- ═══════════════════════════════════════════════════════════════════════════
-- Lettura: ognuno vede solo il proprio profilo
CREATE POLICY "profiles: select own"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

-- Aggiornamento: ognuno modifica solo il proprio
CREATE POLICY "profiles: update own"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Inserimento: gestito dal trigger handle_new_user
CREATE POLICY "profiles: insert own"
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = id);


-- ═══════════════════════════════════════════════════════════════════════════
--  POLICY: restaurants
-- ═══════════════════════════════════════════════════════════════════════════
-- Chiunque (anche anonimo) può leggere i locali attivi
CREATE POLICY "restaurants: public read active"
  ON public.restaurants FOR SELECT
  USING (is_active = TRUE);

-- Il commerciante proprietario vede anche i propri locali non attivi
CREATE POLICY "restaurants: owner read all own"
  ON public.restaurants FOR SELECT
  USING (auth.uid() = owner_id);

-- Solo commercianti possono creare locali
CREATE POLICY "restaurants: commerciante insert"
  ON public.restaurants FOR INSERT
  WITH CHECK (
    auth.uid() = owner_id
    AND public.get_my_role() = 'commerciante'
  );

-- Solo il proprietario può aggiornare/eliminare
CREATE POLICY "restaurants: owner update"
  ON public.restaurants FOR UPDATE
  USING (auth.uid() = owner_id)
  WITH CHECK (auth.uid() = owner_id);

CREATE POLICY "restaurants: owner delete"
  ON public.restaurants FOR DELETE
  USING (auth.uid() = owner_id);


-- ═══════════════════════════════════════════════════════════════════════════
--  POLICY: restaurant_images
-- ═══════════════════════════════════════════════════════════════════════════
CREATE POLICY "images: public read"
  ON public.restaurant_images FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.restaurants r
      WHERE r.id = restaurant_id AND r.is_active = TRUE
    )
  );

CREATE POLICY "images: owner manage"
  ON public.restaurant_images FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.restaurants r
      WHERE r.id = restaurant_id AND r.owner_id = auth.uid()
    )
  );


-- ═══════════════════════════════════════════════════════════════════════════
--  POLICY: tables
-- ═══════════════════════════════════════════════════════════════════════════
-- Tavoli pubblici (lettura): visibili a tutti per i locali attivi
CREATE POLICY "tables: public read"
  ON public.tables FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.restaurants r
      WHERE r.id = restaurant_id AND r.is_active = TRUE
    )
  );

-- Solo il proprietario del locale gestisce i tavoli
CREATE POLICY "tables: owner manage"
  ON public.tables FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.restaurants r
      WHERE r.id = restaurant_id AND r.owner_id = auth.uid()
    )
  );


-- ═══════════════════════════════════════════════════════════════════════════
--  POLICY: availability_schedules
-- ═══════════════════════════════════════════════════════════════════════════
CREATE POLICY "schedules: public read"
  ON public.availability_schedules FOR SELECT
  USING (is_active = TRUE);

CREATE POLICY "schedules: owner manage"
  ON public.availability_schedules FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.restaurants r
      WHERE r.id = restaurant_id AND r.owner_id = auth.uid()
    )
  );


-- ═══════════════════════════════════════════════════════════════════════════
--  POLICY: availability_slots
-- ═══════════════════════════════════════════════════════════════════════════
CREATE POLICY "slots: public read active future"
  ON public.availability_slots FOR SELECT
  USING (is_active = TRUE AND date >= CURRENT_DATE);

-- Il commerciante vede tutti i propri slot (anche passati)
CREATE POLICY "slots: owner read all"
  ON public.availability_slots FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.restaurants r
      WHERE r.id = restaurant_id AND r.owner_id = auth.uid()
    )
  );

CREATE POLICY "slots: owner manage"
  ON public.availability_slots FOR INSERT, UPDATE, DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.restaurants r
      WHERE r.id = restaurant_id AND r.owner_id = auth.uid()
    )
  );


-- ═══════════════════════════════════════════════════════════════════════════
--  POLICY: bookings
-- ═══════════════════════════════════════════════════════════════════════════
-- Cliente: vede solo le proprie prenotazioni
CREATE POLICY "bookings: customer read own"
  ON public.bookings FOR SELECT
  USING (auth.uid() = customer_id);

-- Commerciante: vede le prenotazioni dei propri locali
CREATE POLICY "bookings: owner read venue"
  ON public.bookings FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.restaurants r
      WHERE r.id = restaurant_id AND r.owner_id = auth.uid()
    )
  );

-- Cliente autenticato può creare prenotazioni
CREATE POLICY "bookings: customer insert"
  ON public.bookings FOR INSERT
  WITH CHECK (
    auth.uid() = customer_id
    AND public.get_my_role() = 'cliente'
  );

-- Cliente: può cancellare solo le proprie prenotazioni (cambia status)
CREATE POLICY "bookings: customer cancel"
  ON public.bookings FOR UPDATE
  USING (auth.uid() = customer_id)
  WITH CHECK (
    auth.uid() = customer_id
    AND NEW.status = 'cancelled'   -- il cliente può solo cancellare
  );

-- Commerciante: può aggiornare status (confermare, assegnare tavolo, ecc.)
CREATE POLICY "bookings: owner update"
  ON public.bookings FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.restaurants r
      WHERE r.id = restaurant_id AND r.owner_id = auth.uid()
    )
  );


-- ═══════════════════════════════════════════════════════════════════════════
--  POLICY: payments
-- ═══════════════════════════════════════════════════════════════════════════
-- Cliente vede solo i propri pagamenti
CREATE POLICY "payments: customer read own"
  ON public.payments FOR SELECT
  USING (auth.uid() = customer_id);

-- Commerciante vede i pagamenti delle proprie prenotazioni
CREATE POLICY "payments: owner read"
  ON public.payments FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.bookings b
      JOIN public.restaurants r ON r.id = b.restaurant_id
      WHERE b.id = booking_id AND r.owner_id = auth.uid()
    )
  );

-- I pagamenti vengono creati solo via service_role (webhook Stripe)
-- I clienti non possono inserire pagamenti direttamente


-- ═══════════════════════════════════════════════════════════════════════════
--  POLICY: reviews
-- ═══════════════════════════════════════════════════════════════════════════
-- Tutti leggono le recensioni pubblicate
CREATE POLICY "reviews: public read published"
  ON public.reviews FOR SELECT
  USING (is_published = TRUE);

-- Il cliente vede anche le proprie non pubblicate
CREATE POLICY "reviews: customer read own"
  ON public.reviews FOR SELECT
  USING (auth.uid() = customer_id);

-- Cliente: lascia recensione solo se ha una prenotazione confermata
CREATE POLICY "reviews: customer insert"
  ON public.reviews FOR INSERT
  WITH CHECK (
    auth.uid() = customer_id
    AND public.get_my_role() = 'cliente'
    AND (
      booking_id IS NULL
      OR EXISTS (
        SELECT 1 FROM public.bookings b
        WHERE b.id = booking_id
          AND b.customer_id = auth.uid()
          AND b.status = 'confirmed'
      )
    )
  );

-- Cliente: può modificare solo le proprie recensioni
CREATE POLICY "reviews: customer update own"
  ON public.reviews FOR UPDATE
  USING (auth.uid() = customer_id)
  WITH CHECK (auth.uid() = customer_id);

-- Cliente: può eliminare le proprie recensioni
CREATE POLICY "reviews: customer delete own"
  ON public.reviews FOR DELETE
  USING (auth.uid() = customer_id);


-- ═══════════════════════════════════════════════════════════════════════════
--  POLICY: favorites
-- ═══════════════════════════════════════════════════════════════════════════
CREATE POLICY "favorites: customer read own"
  ON public.favorites FOR SELECT
  USING (auth.uid() = customer_id);

CREATE POLICY "favorites: customer insert"
  ON public.favorites FOR INSERT
  WITH CHECK (
    auth.uid() = customer_id
    AND public.get_my_role() = 'cliente'
  );

CREATE POLICY "favorites: customer delete own"
  ON public.favorites FOR DELETE
  USING (auth.uid() = customer_id);


-- ═══════════════════════════════════════════════════════════════════════════
--  VIEWS UTILI (read-only, sicure)
-- ═══════════════════════════════════════════════════════════════════════════

-- Vista pubblica dei locali con immagine di copertina
CREATE OR REPLACE VIEW public.restaurants_public AS
SELECT
  r.id,
  r.name,
  r.slug,
  r.description,
  r.cuisine,
  r.tags,
  r.neighborhood,
  r.city,
  r.country,
  r.lat,
  r.lng,
  r.price_range,
  r.rating,
  r.review_count,
  r.urgency_label,
  r.social_proof,
  r.deposit_required,
  r.deposit_amount,
  r.max_party_size,
  COALESCE(r.cover_image_url, img.url) AS cover_image_url
FROM public.restaurants r
LEFT JOIN public.restaurant_images img
  ON img.restaurant_id = r.id AND img.is_cover = TRUE
WHERE r.is_active = TRUE;

-- Slot disponibili (solo futuri e attivi)
CREATE OR REPLACE VIEW public.available_slots AS
SELECT
  s.id,
  s.restaurant_id,
  s.date,
  s.start_time,
  s.end_time,
  s.available_seats,
  s.total_seats,
  s.discount_percent,
  s.label,
  ROUND((s.available_seats::NUMERIC / NULLIF(s.total_seats, 0)) * 100) AS occupancy_percent
FROM public.availability_slots s
WHERE s.is_active = TRUE
  AND s.date >= CURRENT_DATE
  AND s.available_seats > 0;


-- ═══════════════════════════════════════════════════════════════════════════
--  SEED DATA — dati di esempio per sviluppo
--  !! Rimuovere in produzione !!
-- ═══════════════════════════════════════════════════════════════════════════
/*
  Per usare i seed:
  1. Crea prima due utenti in Supabase Auth:
     - cliente@demo.com  / Demo1234! → ruolo: cliente
     - bar@demo.com      / Demo1234! → ruolo: commerciante
  2. Copia i loro UUID da Authentication → Users
  3. Sostituisci i placeholder qui sotto e lancia

  -- Esempio (decommentare e compilare):

  DO $$
  DECLARE
    v_cliente_id    UUID := 'UUID-DEL-CLIENTE-QUI';
    v_merchant_id   UUID := 'UUID-DEL-COMMERCIANTE-QUI';
    v_restaurant_id UUID;
  BEGIN
    -- Aggiorna profili (creati dal trigger handle_new_user)
    UPDATE public.profiles SET role = 'cliente'       WHERE id = v_cliente_id;
    UPDATE public.profiles SET role = 'commerciante'  WHERE id = v_merchant_id;

    -- Crea locale demo
    INSERT INTO public.restaurants (
      owner_id, name, slug, description, cuisine, neighborhood, city,
      price_range, rating, review_count, cover_image_url, urgency_label, social_proof
    )
    VALUES (
      v_merchant_id,
      'Spritz Brera',
      'spritz-brera',
      'Il miglior Aperol Spritz del quartiere, con cicchetti veneziani.',
      'Spritz Bar',
      'Brera',
      'Milano',
      '€€',
      4.8,
      124,
      'https://images.unsplash.com/photo-1551024709-8f23befc6f87?auto=format&fit=crop&w=800&q=80',
      'Quasi esaurito',
      '12 prenotazioni oggi'
    )
    RETURNING id INTO v_restaurant_id;

    -- Crea tavoli
    INSERT INTO public.tables (restaurant_id, name, capacity_min, capacity_max, is_outdoor)
    VALUES
      (v_restaurant_id, 'Bancone',      1, 4,  FALSE),
      (v_restaurant_id, 'Tavolo A',     2, 4,  FALSE),
      (v_restaurant_id, 'Tavolo B',     2, 6,  FALSE),
      (v_restaurant_id, 'Dehor 1',      2, 4,  TRUE),
      (v_restaurant_id, 'Dehor 2',      4, 8,  TRUE);

    -- Crea template disponibilità (ven-dom, 17:30–21:00)
    INSERT INTO public.availability_schedules (
      restaurant_id, days_of_week, start_time, end_time,
      total_seats, slot_duration_min, label
    )
    VALUES (
      v_restaurant_id,
      ARRAY['ven','sab','dom']::day_of_week[],
      '17:30', '21:00',
      40, 30,
      'Aperitivo serale'
    );

    -- Crea slot concreti per i prossimi 7 giorni
    INSERT INTO public.availability_slots (
      restaurant_id, date, start_time, end_time,
      total_seats, available_seats, discount_percent, label
    )
    VALUES
      (v_restaurant_id, CURRENT_DATE + 1, '17:30', '18:30', 40, 40, 15, 'Early bird'),
      (v_restaurant_id, CURRENT_DATE + 1, '18:30', '19:30', 40, 28, 0,  NULL),
      (v_restaurant_id, CURRENT_DATE + 1, '19:30', '20:30', 40, 12, 0,  'Quasi esaurito'),
      (v_restaurant_id, CURRENT_DATE + 2, '17:30', '18:30', 40, 40, 15, 'Early bird'),
      (v_restaurant_id, CURRENT_DATE + 2, '18:30', '19:30', 40, 35, 0,  NULL);

  END $$;
*/


-- ═══════════════════════════════════════════════════════════════════════════
--  RIEPILOGO PERMESSI
-- ═══════════════════════════════════════════════════════════════════════════
/*
  Tabella               | Anonimo      | Cliente           | Commerciante (proprio)
  ─────────────────────────────────────────────────────────────────────────────────
  profiles              | –            | read/update own   | read/update own
  restaurants           | read active  | read active       | CRUD own
  restaurant_images     | read active  | read active       | CRUD own locale
  tables                | read active  | read active       | CRUD own locale
  availability_schedules| read active  | read active       | CRUD own locale
  availability_slots    | read future  | read future       | CRUD own / read all
  bookings              | –            | insert + own CRUD | read own venue / update status
  payments              | –            | read own          | read own venue
  reviews               | read public  | CRUD own          | –
  favorites             | –            | CRUD own          | –
*/
