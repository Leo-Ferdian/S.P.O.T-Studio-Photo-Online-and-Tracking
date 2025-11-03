--
-- PostgreSQL database cluster dump
--

\restrict dZzXABebR6I5s3bbZj6o2AbCMqaj6SO2NWL0FpFFz8QGPziXGkPQU0C4vyzhQg4

SET default_transaction_read_only = off;

SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;

--
-- Roles
--

CREATE ROLE abyan;
ALTER ROLE abyan WITH NOSUPERUSER INHERIT NOCREATEROLE NOCREATEDB LOGIN NOREPLICATION NOBYPASSRLS PASSWORD 'SCRAM-SHA-256$4096:IWIrYjbisVvxwJqFpWhmmw==$02BKUdwjhwuXveNBOJ8Dbm3rXL8LbGizd4LVvRLpD9Q=:OeKD2+/30I9B6KHksbIADaSRkEr8p+VPxawRkzuaII8=';
CREATE ROLE leofe;
ALTER ROLE leofe WITH SUPERUSER INHERIT CREATEROLE CREATEDB LOGIN REPLICATION BYPASSRLS PASSWORD 'SCRAM-SHA-256$4096:cnONrntX4MwSB0nau5ox9w==$0LapB1QNyyvyMNirAaPF3eEkrRF61wQiFcakPDKvNGY=:adFfx3a2YquO9WRfn2h6Cd7ci4MSqxjNb69CioL8w3Y=';
CREATE ROLE phourto_admin;
ALTER ROLE phourto_admin WITH SUPERUSER INHERIT CREATEROLE CREATEDB LOGIN NOREPLICATION BYPASSRLS PASSWORD 'SCRAM-SHA-256$4096:aGF/nHK/WcOoH3DJG/7ONA==$8prT5KtLndi5/7mTu7QHAGdtmYKpoBaFIEbug3m68tI=:abRX9/BfKbZxpFtB3D5Nv2MQSbuTuJDM4oVe9hukD7Q=';
CREATE ROLE postgres;
ALTER ROLE postgres WITH SUPERUSER INHERIT CREATEROLE CREATEDB LOGIN REPLICATION BYPASSRLS PASSWORD 'SCRAM-SHA-256$4096:N1/JdVe/2BKK8kvyYg3a8Q==$Ssi6f9/37rcWFYC1Bo4QxfUp7w9H3GDguDnA23dvbQM=:0+axyjUb9fjZB2lQ24Dhpg8iumA+FBuOOyZvIbyO66c=';

--
-- User Configurations
--








\unrestrict dZzXABebR6I5s3bbZj6o2AbCMqaj6SO2NWL0FpFFz8QGPziXGkPQU0C4vyzhQg4

--
-- Databases
--

--
-- Database "template1" dump
--

\connect template1

--
-- PostgreSQL database dump
--

\restrict KezZ3bjgXBA2AFQ62KCQ9xlUjIiXjXPbNv9cRM3tN39TNTucSqMEnAHuaLbNdPL

-- Dumped from database version 17.6
-- Dumped by pg_dump version 17.6

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- PostgreSQL database dump complete
--

\unrestrict KezZ3bjgXBA2AFQ62KCQ9xlUjIiXjXPbNv9cRM3tN39TNTucSqMEnAHuaLbNdPL

--
-- Database "belajar_db" dump
--

--
-- PostgreSQL database dump
--

\restrict vPkLhxN2wlIcvRDB4yzfdN5ztHFG0VxT3LrNrJ38NXkYIaFfhcdN9Asc9EDAzdh

-- Dumped from database version 17.6
-- Dumped by pg_dump version 17.6

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: belajar_db; Type: DATABASE; Schema: -; Owner: leofe
--

CREATE DATABASE belajar_db WITH TEMPLATE = template0 ENCODING = 'UTF8' LOCALE_PROVIDER = libc LOCALE = 'English_United States.1252';


ALTER DATABASE belajar_db OWNER TO leofe;

\unrestrict vPkLhxN2wlIcvRDB4yzfdN5ztHFG0VxT3LrNrJ38NXkYIaFfhcdN9Asc9EDAzdh
\connect belajar_db
\restrict vPkLhxN2wlIcvRDB4yzfdN5ztHFG0VxT3LrNrJ38NXkYIaFfhcdN9Asc9EDAzdh

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- PostgreSQL database dump complete
--

\unrestrict vPkLhxN2wlIcvRDB4yzfdN5ztHFG0VxT3LrNrJ38NXkYIaFfhcdN9Asc9EDAzdh

--
-- Database "phourto_db" dump
--

--
-- PostgreSQL database dump
--

\restrict YoNqv73Yf3qbmUBr6ebdUzMd2sPMtl3R0HaL3VodU213RArS8jvmg5eojvjEPeh

-- Dumped from database version 17.6
-- Dumped by pg_dump version 17.6

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: phourto_db; Type: DATABASE; Schema: -; Owner: phourto_admin
--

CREATE DATABASE phourto_db WITH TEMPLATE = template0 ENCODING = 'UTF8' LOCALE_PROVIDER = libc LOCALE = 'English_United States.1252';


ALTER DATABASE phourto_db OWNER TO phourto_admin;

\unrestrict YoNqv73Yf3qbmUBr6ebdUzMd2sPMtl3R0HaL3VodU213RArS8jvmg5eojvjEPeh
\connect phourto_db
\restrict YoNqv73Yf3qbmUBr6ebdUzMd2sPMtl3R0HaL3VodU213RArS8jvmg5eojvjEPeh

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: phourto_db; Type: DATABASE PROPERTIES; Schema: -; Owner: phourto_admin
--

ALTER DATABASE phourto_db SET search_path TO 'phourto', 'public';


\unrestrict YoNqv73Yf3qbmUBr6ebdUzMd2sPMtl3R0HaL3VodU213RArS8jvmg5eojvjEPeh
\connect phourto_db
\restrict YoNqv73Yf3qbmUBr6ebdUzMd2sPMtl3R0HaL3VodU213RArS8jvmg5eojvjEPeh

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: phourto; Type: SCHEMA; Schema: -; Owner: phourto_admin
--

CREATE SCHEMA phourto;


ALTER SCHEMA phourto OWNER TO phourto_admin;

--
-- Name: uuid-ossp; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA public;


--
-- Name: EXTENSION "uuid-ossp"; Type: COMMENT; Schema: -; Owner: 
--

COMMENT ON EXTENSION "uuid-ossp" IS 'generate universally unique identifiers (UUIDs)';


--
-- Name: booking_action_enum; Type: TYPE; Schema: phourto; Owner: phourto_admin
--

CREATE TYPE phourto.booking_action_enum AS ENUM (
    'CREATED',
    'STATUS_CHANGED',
    'PAYMENT_RECEIVED',
    'RESCHEDULED',
    'DETAILS_UPDATED'
);


ALTER TYPE phourto.booking_action_enum OWNER TO phourto_admin;

--
-- Name: booking_status_enum; Type: TYPE; Schema: phourto; Owner: phourto_admin
--

CREATE TYPE phourto.booking_status_enum AS ENUM (
    'PENDING',
    'PAID-DP',
    'PAID-FULL',
    'EXPIRED',
    'CANCELLED',
    'COMPLETED',
    'FAILED'
);


ALTER TYPE phourto.booking_status_enum OWNER TO phourto_admin;

--
-- Name: user_role_enum; Type: TYPE; Schema: phourto; Owner: phourto_admin
--

CREATE TYPE phourto.user_role_enum AS ENUM (
    'admin',
    'customer'
);


ALTER TYPE phourto.user_role_enum OWNER TO phourto_admin;

--
-- Name: zip_status_enum; Type: TYPE; Schema: phourto; Owner: leofe
--

CREATE TYPE phourto.zip_status_enum AS ENUM (
    'PENDING',
    'PROCESSING',
    'READY',
    'FAILED'
);


ALTER TYPE phourto.zip_status_enum OWNER TO leofe;

--
-- Name: trigger_set_timestamp(); Type: FUNCTION; Schema: phourto; Owner: phourto_admin
--

CREATE FUNCTION phourto.trigger_set_timestamp() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
    BEGIN
        NEW.updated_at = NOW();
        RETURN NEW;
    END;
    $$;


ALTER FUNCTION phourto.trigger_set_timestamp() OWNER TO phourto_admin;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: addons; Type: TABLE; Schema: phourto; Owner: phourto_admin
--

CREATE TABLE phourto.addons (
    addon_id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    package_id uuid NOT NULL,
    addon_name character varying(255) NOT NULL,
    addon_price numeric(10,2) NOT NULL,
    addon_unit character varying(50),
    max_qty integer DEFAULT 99 NOT NULL,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE phourto.addons OWNER TO phourto_admin;

--
-- Name: booking_addons; Type: TABLE; Schema: phourto; Owner: phourto_admin
--

CREATE TABLE phourto.booking_addons (
    booking_addon_id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    booking_id uuid NOT NULL,
    addon_id uuid NOT NULL,
    quantity integer DEFAULT 1 NOT NULL,
    price_at_booking numeric(10,2) NOT NULL,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE phourto.booking_addons OWNER TO phourto_admin;

--
-- Name: booking_history; Type: TABLE; Schema: phourto; Owner: phourto_admin
--

CREATE TABLE phourto.booking_history (
    history_id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    booking_id uuid NOT NULL,
    user_id_actor uuid,
    action_type phourto.booking_action_enum NOT NULL,
    details_before jsonb,
    details_after jsonb,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE phourto.booking_history OWNER TO phourto_admin;

--
-- Name: bookings; Type: TABLE; Schema: phourto; Owner: phourto_admin
--

CREATE TABLE phourto.bookings (
    booking_id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    user_id uuid NOT NULL,
    package_id uuid NOT NULL,
    room_id uuid NOT NULL,
    start_time timestamp with time zone NOT NULL,
    end_time timestamp with time zone NOT NULL,
    total_price numeric(12,2) NOT NULL,
    dp_amount numeric(12,2) DEFAULT 0 NOT NULL,
    amount_paid numeric(12,2) DEFAULT 0 NOT NULL,
    amount_due numeric(12,2) GENERATED ALWAYS AS ((total_price - amount_paid)) STORED,
    payment_status phourto.booking_status_enum DEFAULT 'PENDING'::phourto.booking_status_enum NOT NULL,
    payment_deadline timestamp with time zone,
    payment_gateway_ref text,
    payment_qr_url text,
    payment_qr_expires_at timestamp with time zone,
    unique_code character varying(20),
    photo_delivery_url text,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    zip_status phourto.zip_status_enum DEFAULT 'PENDING'::phourto.zip_status_enum,
    zip_file_key text,
    zip_created_at timestamp with time zone
);


ALTER TABLE phourto.bookings OWNER TO phourto_admin;

--
-- Name: branches; Type: TABLE; Schema: phourto; Owner: phourto_admin
--

CREATE TABLE phourto.branches (
    branch_id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    branch_name character varying(255) NOT NULL,
    address text,
    open_hours character varying(100),
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE phourto.branches OWNER TO phourto_admin;

--
-- Name: packages; Type: TABLE; Schema: phourto; Owner: phourto_admin
--

CREATE TABLE phourto.packages (
    package_id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    room_id uuid NOT NULL,
    package_name character varying(255) NOT NULL,
    capacity character varying(50),
    duration character varying(100),
    inclusions text,
    price numeric(12,2) NOT NULL,
    price_type text NOT NULL,
    duration_in_minutes integer NOT NULL,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE phourto.packages OWNER TO phourto_admin;

--
-- Name: photos; Type: TABLE; Schema: phourto; Owner: phourto_admin
--

CREATE TABLE phourto.photos (
    photo_id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    booking_id uuid NOT NULL,
    file_key text NOT NULL,
    file_url text,
    file_name_original text,
    file_size_bytes bigint,
    mime_type character varying(100),
    uploaded_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE phourto.photos OWNER TO phourto_admin;

--
-- Name: room_blocks; Type: TABLE; Schema: phourto; Owner: phourto_admin
--

CREATE TABLE phourto.room_blocks (
    block_id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    room_id uuid NOT NULL,
    start_time timestamp with time zone NOT NULL,
    end_time timestamp with time zone NOT NULL,
    reason text,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE phourto.room_blocks OWNER TO phourto_admin;

--
-- Name: rooms; Type: TABLE; Schema: phourto; Owner: phourto_admin
--

CREATE TABLE phourto.rooms (
    room_id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    branch_id uuid NOT NULL,
    room_name_display character varying(255) NOT NULL,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE phourto.rooms OWNER TO phourto_admin;

--
-- Name: users; Type: TABLE; Schema: phourto; Owner: phourto_admin
--

CREATE TABLE phourto.users (
    user_id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    full_name character varying(255),
    email character varying(255) NOT NULL,
    phone_number character varying(50),
    password_hash text NOT NULL,
    role phourto.user_role_enum DEFAULT 'customer'::phourto.user_role_enum NOT NULL,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE phourto.users OWNER TO phourto_admin;

--
-- Data for Name: addons; Type: TABLE DATA; Schema: phourto; Owner: phourto_admin
--

COPY phourto.addons (addon_id, package_id, addon_name, addon_price, addon_unit, max_qty, created_at, updated_at) FROM stdin;
bd97fb79-d07c-4d98-bd8d-ef053204e210	566ba263-f37e-452f-8e6b-698e377a162d	Tambahan Orang	45000.00	Orang (1 Photo Printing)	8	2025-11-01 13:54:24.618397+07	2025-11-01 13:54:24.618397+07
0c8715a3-05a5-4eba-83aa-5534721044bf	3b74f131-9bf8-4d86-b959-9e5baa217ba0	Tambahan Orang	55000.00	Orang (Exclude Cetakan)	99	2025-11-01 13:54:24.618397+07	2025-11-01 13:54:24.618397+07
b18ee3e4-41f4-4a37-9f46-210a6e977f3e	3b74f131-9bf8-4d86-b959-9e5baa217ba0	Tambahan 1 Basic Frame Print	15000.00	Print	99	2025-11-01 13:54:24.618397+07	2025-11-01 13:54:24.618397+07
cb272247-2e27-4d8d-89d5-18fabf05912a	3b74f131-9bf8-4d86-b959-9e5baa217ba0	Tambahan 5 Basic Frame Print	70000.00	5 Print	99	2025-11-01 13:54:24.618397+07	2025-11-01 13:54:24.618397+07
d4335d17-6957-4b4e-b9a1-76ea421251a6	3b74f131-9bf8-4d86-b959-9e5baa217ba0	Tambahan 1 Special Frame Print	25000.00	Print	99	2025-11-01 13:54:24.618397+07	2025-11-01 13:54:24.618397+07
3f85911b-d47f-49c9-9a63-ca93c598d678	b9376bac-d650-475e-b491-1f618d3a7525	Tambahan Orang	45000.00	Orang (Include 1 Cetakan)	4	2025-11-01 13:54:24.618397+07	2025-11-01 13:54:24.618397+07
4ebe75ef-d3bc-4a3a-bbd5-cf5b0f9d65b8	97b55045-2e8e-4ace-8020-b935ce838c48	Penambahan Orang	49000.00	Orang (dapet 1 Cetakan)	2	2025-11-01 13:54:24.618397+07	2025-11-01 13:54:24.618397+07
b7ad0a27-e729-4548-93b2-2e3f3461c111	a7a36b40-9f07-4255-8a72-bea1a7d88aae	Penambahan Orang	49000.00	Orang (dapet 1 Cetakan)	2	2025-11-01 13:54:24.618397+07	2025-11-01 13:54:24.618397+07
eef1af1b-6dc4-426c-a3df-29d59eb51fcf	b695c305-7ba5-4788-a1eb-06cfe54efed6	Penambahan Orang	49000.00	Orang (dapet 1 Cetakan)	2	2025-11-01 13:54:24.618397+07	2025-11-01 13:54:24.618397+07
b5be5a4e-8c74-453b-beb4-02a14c2670e9	0af2bcce-4984-4a7b-a4f8-65542807a334	Penambahan Orang	49000.00	Orang (dapet 1 Cetakan)	2	2025-11-01 13:54:24.618397+07	2025-11-01 13:54:24.618397+07
ac298792-7a21-4306-953d-ae8a0ca8bea9	e926c57e-b990-4866-a181-fb79e8058c53	Tambahan Orang	45000.00	Orang (Include 1 Cetakan)	4	2025-11-01 13:54:24.618397+07	2025-11-01 13:54:24.618397+07
c637bddc-b992-466c-a93e-4055b7be69a0	7a3fe54c-c753-4f1b-b7b0-b606f8dcaa95	Tambahan Orang	55000.00	Orang (Exclude Cetakan)	99	2025-11-01 13:54:24.618397+07	2025-11-01 13:54:24.618397+07
4eb4493e-00c9-4b33-bb9b-a5654d5e0d60	7a3fe54c-c753-4f1b-b7b0-b606f8dcaa95	Tambahan 1 Basic Frame Print	15000.00	Print	99	2025-11-01 13:54:24.618397+07	2025-11-01 13:54:24.618397+07
a10fb1d5-3bbb-4f1b-a233-89e6a32a33d0	7a3fe54c-c753-4f1b-b7b0-b606f8dcaa95	Tambahan 5 Basic Frame Print	70000.00	5 Print	99	2025-11-01 13:54:24.618397+07	2025-11-01 13:54:24.618397+07
25dd8b86-8352-45f0-bb7c-bc8ef6061498	7a3fe54c-c753-4f1b-b7b0-b606f8dcaa95	Tambahan 1 Special Frame Print	25000.00	Print	99	2025-11-01 13:54:24.618397+07	2025-11-01 13:54:24.618397+07
50525f6a-9a7f-41af-954f-41accd4eddc4	6d50d52c-69b6-438c-ad66-76125d4e033d	Penambahan Orang	49000.00	Orang (dapet 1 Cetakan)	2	2025-11-01 13:54:24.618397+07	2025-11-01 13:54:24.618397+07
aea1b02e-9792-4ecb-a80a-bb4f10a422d1	94f67dfc-f50f-41a2-8fc1-c1ff6ab12513	Penambahan Orang	49000.00	Orang (dapet 1 Cetakan)	2	2025-11-01 13:54:24.618397+07	2025-11-01 13:54:24.618397+07
56382796-6889-4e29-9ebc-7c8b669f690a	5066664d-bae8-42eb-8e17-35eef32acc61	Penambahan Orang	49000.00	Orang (dapet 1 Cetakan)	2	2025-11-01 13:54:24.618397+07	2025-11-01 13:54:24.618397+07
2be33f35-3158-4f76-8330-91570d8bf1eb	0446381a-ff09-4681-888a-23b39ca79ae9	Penambahan Orang	49000.00	Orang (dapet 1 Cetakan)	2	2025-11-01 13:54:24.618397+07	2025-11-01 13:54:24.618397+07
\.


--
-- Data for Name: booking_addons; Type: TABLE DATA; Schema: phourto; Owner: phourto_admin
--

COPY phourto.booking_addons (booking_addon_id, booking_id, addon_id, quantity, price_at_booking, created_at) FROM stdin;
\.


--
-- Data for Name: booking_history; Type: TABLE DATA; Schema: phourto; Owner: phourto_admin
--

COPY phourto.booking_history (history_id, booking_id, user_id_actor, action_type, details_before, details_after, created_at) FROM stdin;
e854922e-5f02-44f2-a51a-84b2a98a8d49	a34e95eb-8f94-499e-bf21-670db7bd047b	7f11bf3f-0a23-4183-9301-931603757512	CREATED	\N	{"room_id": "aef50ffd-3d8b-449e-a8a8-ec2decc57c2b", "user_id": "7f11bf3f-0a23-4183-9301-931603757512", "end_time": "2025-12-25T11:30:00.000Z", "dp_amount": "62500.00", "amount_due": "125000.00", "booking_id": "a34e95eb-8f94-499e-bf21-670db7bd047b", "created_at": "2025-11-02T11:37:30.010Z", "package_id": "3894769e-2d0a-447e-b9df-6f6cbc5e665e", "start_time": "2025-12-25T11:00:00.000Z", "updated_at": "2025-11-02T11:37:30.010Z", "zip_status": "PENDING", "amount_paid": "0.00", "total_price": "125000.00", "unique_code": "PHR-450011", "zip_file_key": null, "payment_qr_url": null, "payment_status": "PENDING", "zip_created_at": null, "payment_deadline": "2025-11-02T12:37:30.011Z", "photo_delivery_url": null, "payment_gateway_ref": null, "payment_qr_expires_at": null}	2025-11-02 18:37:30.010865+07
019ae066-70bf-446f-a302-3d48a215f2e0	f524a38a-0c0e-4218-addf-f133ea5f0268	7f11bf3f-0a23-4183-9301-931603757512	CREATED	\N	{"room_id": "aef50ffd-3d8b-449e-a8a8-ec2decc57c2b", "user_id": "7f11bf3f-0a23-4183-9301-931603757512", "end_time": "2025-11-30T10:30:00.000Z", "dp_amount": "62500.00", "amount_due": "125000.00", "booking_id": "f524a38a-0c0e-4218-addf-f133ea5f0268", "created_at": "2025-11-02T11:37:30.089Z", "package_id": "3894769e-2d0a-447e-b9df-6f6cbc5e665e", "start_time": "2025-11-30T10:00:00.000Z", "updated_at": "2025-11-02T11:37:30.089Z", "zip_status": "PENDING", "amount_paid": "0.00", "total_price": "125000.00", "unique_code": "PHR-450089", "zip_file_key": null, "payment_qr_url": null, "payment_status": "PENDING", "zip_created_at": null, "payment_deadline": "2025-11-02T12:37:30.089Z", "photo_delivery_url": null, "payment_gateway_ref": null, "payment_qr_expires_at": null}	2025-11-02 18:37:30.089302+07
c30b69b4-4646-4f33-85f0-cdac1cc5d1c4	a34e95eb-8f94-499e-bf21-670db7bd047b	06e2bad7-0256-4604-a70a-a0cc6cad6f86	STATUS_CHANGED	{"status": "PENDING"}	{"status": "PAID-FULL"}	2025-11-02 18:37:30.513686+07
b7a2b1db-08a9-423d-aef4-1440000abba4	a34e95eb-8f94-499e-bf21-670db7bd047b	06e2bad7-0256-4604-a70a-a0cc6cad6f86	RESCHEDULED	{"room": "aef50ffd-3d8b-449e-a8a8-ec2decc57c2b", "start": "2025-12-25T11:00:00.000Z"}	{"room": "58877723-d72a-4635-aa98-162b893538dc", "start": "2025-12-30T13:00:00.000Z", "reason": "Pemindahan jadwal oleh Admin atas permintaan pelanggan."}	2025-11-02 18:37:30.594227+07
483837d2-8d63-4c2d-819b-9b138f2bf0a6	a34e95eb-8f94-499e-bf21-670db7bd047b	06e2bad7-0256-4604-a70a-a0cc6cad6f86	STATUS_CHANGED	{"status": "PAID-FULL"}	{"status": "COMPLETED"}	2025-11-02 18:37:32.537349+07
\.


--
-- Data for Name: bookings; Type: TABLE DATA; Schema: phourto; Owner: phourto_admin
--

COPY phourto.bookings (booking_id, user_id, package_id, room_id, start_time, end_time, total_price, dp_amount, amount_paid, payment_status, payment_deadline, payment_gateway_ref, payment_qr_url, payment_qr_expires_at, unique_code, photo_delivery_url, created_at, updated_at, zip_status, zip_file_key, zip_created_at) FROM stdin;
f524a38a-0c0e-4218-addf-f133ea5f0268	7f11bf3f-0a23-4183-9301-931603757512	3894769e-2d0a-447e-b9df-6f6cbc5e665e	aef50ffd-3d8b-449e-a8a8-ec2decc57c2b	2025-11-30 17:00:00+07	2025-11-30 17:30:00+07	125000.00	62500.00	0.00	PENDING	2025-11-02 19:37:30.089+07	\N	\N	\N	PHR-450089	\N	2025-11-02 18:37:30.089302+07	2025-11-02 18:37:30.089302+07	PENDING	\N	\N
a34e95eb-8f94-499e-bf21-670db7bd047b	7f11bf3f-0a23-4183-9301-931603757512	3894769e-2d0a-447e-b9df-6f6cbc5e665e	58877723-d72a-4635-aa98-162b893538dc	2025-12-30 20:00:00+07	2025-12-30 20:30:00+07	125000.00	62500.00	0.00	COMPLETED	2025-11-02 19:37:30.011+07	\N	\N	\N	PHR-450011	/my-bookings/a34e95eb-8f94-499e-bf21-670db7bd047b/gallery	2025-11-02 18:37:30.010865+07	2025-11-02 18:37:32.537349+07	PENDING	\N	\N
\.


--
-- Data for Name: branches; Type: TABLE DATA; Schema: phourto; Owner: phourto_admin
--

COPY phourto.branches (branch_id, branch_name, address, open_hours, created_at, updated_at) FROM stdin;
f5534e4c-13d5-436a-9624-3705ef1fc989	Studio Panam	Jl. Bangau Sakti No.141, Simpang Baru, Kec. Tampan, Kota Pekanbaru, Riau 28292	09:00-22:00	2025-11-01 13:54:24.618397+07	2025-11-01 13:54:24.618397+07
c4e3d584-9123-49e9-b644-413db743ca33	Studio Sail	Jl. Gunung Sahilan No.19, Sekip, Kec. Lima Puluh, Kota Pekanbaru, Riau 28141	09:00-22:00	2025-11-01 13:54:24.618397+07	2025-11-01 13:54:24.618397+07
f0bce5e9-4842-42cf-ad97-979c2d57cd32	Studio Marpoyan	Jl. Air Dingin Ujung, Simpang Tiga, Kec. Bukit Raya, Kota Pekanbaru, Riau 28282	09:00-22:00	2025-11-01 13:54:24.618397+07	2025-11-01 13:54:24.618397+07
\.


--
-- Data for Name: packages; Type: TABLE DATA; Schema: phourto; Owner: phourto_admin
--

COPY phourto.packages (package_id, room_id, package_name, capacity, duration, inclusions, price, price_type, duration_in_minutes, created_at, updated_at) FROM stdin;
1489cd14-20cb-4f8a-91ce-bf7ae02b81fd	58877723-d72a-4635-aa98-162b893538dc	Basic Plan (1-2 Orang)	1-2 Orang	30 menit	1 Photo with Printed basic frame	125000.00	per_package	30	2025-11-01 13:54:24.618397+07	2025-11-01 13:54:24.618397+07
3d49fd04-5fd6-4a40-8d04-10a3c2fb0211	58877723-d72a-4635-aa98-162b893538dc	Ramean Plan (5 Orang)	5 Orang	30 menit	2 Photo with Printed Basic Frame, 1 Photo with Printed Special Frame	215000.00	per_package	30	2025-11-01 13:54:24.618397+07	2025-11-01 13:54:24.618397+07
566ba263-f37e-452f-8e6b-698e377a162d	799146e4-0931-4552-8184-767ad23d4cb7	Paket 1-2 Orang (Fisheye)	1-10 Orang	30 Menit (15 Sesi + 5 Pilih + 5 Cetak)	2 Photo Printing / Paket	110000.00	per_package	30	2025-11-01 13:54:24.618397+07	2025-11-01 13:54:24.618397+07
3b74f131-9bf8-4d86-b959-9e5baa217ba0	90e90302-fc2e-49e4-99c3-cde40550b528	Blank Space Paket 15 Orang	1-15 Orang	1 jam (45 Sesi + 15 Pilih & Cetak)	5 Photo Printing (2 A5 + 3 4R)	815000.00	per_package	60	2025-11-01 13:54:24.618397+07	2025-11-01 13:54:24.618397+07
b9376bac-d650-475e-b491-1f618d3a7525	90e90302-fc2e-49e4-99c3-cde40550b528	Spotlight Paket 1-2 Orang	1-2 Orang	30 Menit (20 Sesi + 10 Pilih & Cetak)	1 4R Photo Printing / Orang	175000.00	per_package	30	2025-11-01 13:54:24.618397+07	2025-11-01 13:54:24.618397+07
97b55045-2e8e-4ace-8020-b935ce838c48	58877723-d72a-4635-aa98-162b893538dc	Y2K Yearbook Basic Plan (BLUE)	2 Orang	30 menit (20 Foto + 10 Pilih)	2 Photo Printing with Y2K Basic Frame	129000.00	per_package	30	2025-11-01 13:54:24.618397+07	2025-11-01 13:54:24.618397+07
a7a36b40-9f07-4255-8a72-bea1a7d88aae	58877723-d72a-4635-aa98-162b893538dc	Y2K Yearbook Ramean Plan (BLUE)	5 Orang	30 menit (20 Foto + 10 Pilih)	5 Photo Printing with Y2K Basic Frame	299000.00	per_package	30	2025-11-01 13:54:24.618397+07	2025-11-01 13:54:24.618397+07
b695c305-7ba5-4788-a1eb-06cfe54efed6	58877723-d72a-4635-aa98-162b893538dc	Y2K YEARBOOK BASIC PLAN (PINK)	2 Orang	30 menit (20 Foto + 10 Pilih)	2 Photo Printing with Y2K Basic Frame	129000.00	per_package	30	2025-11-01 13:54:24.618397+07	2025-11-01 13:54:24.618397+07
0af2bcce-4984-4a7b-a4f8-65542807a334	58877723-d72a-4635-aa98-162b893538dc	Y2K YEARBOOK RAMEAN PLAN (PINK)	5 Orang	30 menit (20 Foto + 10 Pilih)	5 Photo Printing with Y2K Basic Frame	299000.00	per_package	30	2025-11-01 13:54:24.618397+07	2025-11-01 13:54:24.618397+07
224735dd-934a-4f7e-a208-26288af0b9b1	9f13d4a6-0dea-495e-9da6-f1cc1cf0a1dd	Basic Plan (1-2 Orang)	1-2 Orang	30 menit	1 Photo with Printed basic frame	125000.00	per_package	30	2025-11-01 13:54:24.618397+07	2025-11-01 13:54:24.618397+07
393489c8-e9c0-4f63-b3d7-e9f63836f508	9f13d4a6-0dea-495e-9da6-f1cc1cf0a1dd	Ramean Plan (5 Orang)	5 Orang	30 menit	2 Photo with Printed Basic Frame, 1 Photo with Printed Special Frame	215000.00	per_package	30	2025-11-01 13:54:24.618397+07	2025-11-01 13:54:24.618397+07
5cf48469-55d8-4b30-a692-84b17e610296	e81944df-c94b-422e-b132-82529f369e2a	Fisheye Room Paket per Orang	1-6 Orang	30 menit (15 Foto + 15 Pilih & Cetak)	1 Photo with Printed / Orang	65000.00	per_person	30	2025-11-01 13:54:24.618397+07	2025-11-01 13:54:24.618397+07
00b43185-9ba6-4ccb-9478-d9c33d46de98	b3f136c7-03f8-41e7-81cf-65dc21302033	Elevator Paket per Orang	1-2 Orang	30 menit (20 Sesi + 10 Pilih & Cetak)	1 4R Photo Printing Basic / Orang	65000.00	per_person	30	2025-11-01 13:54:24.618397+07	2025-11-01 13:54:24.618397+07
e926c57e-b990-4866-a181-fb79e8058c53	4ba0837f-60e8-4ca2-800d-d9ce8e195bc8	Spotlight Room Paket 1-2 Orang	1-2 Orang	30 menit (20 Sesi + 10 Pilih & Cetak)	1 4R Photo Printing Basic / Orang	175000.00	per_package	30	2025-11-01 13:54:24.618397+07	2025-11-01 13:54:24.618397+07
7a3fe54c-c753-4f1b-b7b0-b606f8dcaa95	4ba0837f-60e8-4ca2-800d-d9ce8e195bc8	Blank Space Paket 15 Orang	1-15 Orang	1 jam (45 Sesi + 15 Pilih & Cetak)	5 Photo Printing (2 A5 + 3 4R)	815000.00	per_package	60	2025-11-01 13:54:24.618397+07	2025-11-01 13:54:24.618397+07
6d50d52c-69b6-438c-ad66-76125d4e033d	9f13d4a6-0dea-495e-9da6-f1cc1cf0a1dd	Y2K Yearbook Basic Plan	2 Orang	30 menit (20 Foto + 10 Pilih)	2 Photo Printing with Y2K Basic Frame	129000.00	per_package	30	2025-11-01 13:54:24.618397+07	2025-11-01 13:54:24.618397+07
94f67dfc-f50f-41a2-8fc1-c1ff6ab12513	9f13d4a6-0dea-495e-9da6-f1cc1cf0a1dd	Y2K Yearbook Ramean Plan	5 Orang	30 menit (20 Foto + 10 Pilih)	5 Photo Printing with Y2K Basic Frame	299000.00	per_package	30	2025-11-01 13:54:24.618397+07	2025-11-01 13:54:24.618397+07
3894769e-2d0a-447e-b9df-6f6cbc5e665e	aef50ffd-3d8b-449e-a8a8-ec2decc57c2b	Basic Plan (1-2 Orang)	1-2 Orang	30 menit	1 Photo with Printed basic frame	125000.00	per_package	30	2025-11-01 13:54:24.618397+07	2025-11-01 13:54:24.618397+07
a893475a-7fa2-40d7-b88b-64f39511e580	aef50ffd-3d8b-449e-a8a8-ec2decc57c2b	Ramean Plan (5 Orang)	5 Orang	30 menit	2 Photo with Printed Basic Frame, 1 Photo with Printed Special Frame	215000.00	per_package	30	2025-11-01 13:54:24.618397+07	2025-11-01 13:54:24.618397+07
5066664d-bae8-42eb-8e17-35eef32acc61	0a88cc8f-0046-4a48-a099-0a92be7cda50	Y2K Yearbook Basic Plan	2 Orang	30 menit (20 Foto + 10 Pilih)	2 Photo Printing with Y2K Basic Frame	129000.00	per_package	30	2025-11-01 13:54:24.618397+07	2025-11-01 13:54:24.618397+07
0446381a-ff09-4681-888a-23b39ca79ae9	0a88cc8f-0046-4a48-a099-0a92be7cda50	Y2K Yearbook Ramean Plan	5 Orang	30 menit (20 Foto + 10 Pilih)	5 Photo Printing with Y2K Basic Frame	299000.00	per_package	30	2025-11-01 13:54:24.618397+07	2025-11-01 13:54:24.618397+07
d7021a66-41d8-46fe-9ef1-e8b7cc626861	aef50ffd-3d8b-449e-a8a8-ec2decc57c2b	Paket Tes Baru (V1.10)	1-5 Orang	30 Menit (15 Sesi + 15 Pilih)	- 2 Cetak 4R\n- Semua File	150000.00	per_package	30	2025-11-02 13:37:01.218532+07	2025-11-02 13:37:01.218532+07
61a99915-c883-4d7b-a7ef-cd011c3d6e0e	aef50ffd-3d8b-449e-a8a8-ec2decc57c2b	Paket Tes Baru (V1.10)	1-5 Orang	30 Menit (15 Sesi + 15 Pilih)	- 2 Cetak 4R\n- Semua File	150000.00	per_package	30	2025-11-02 18:01:36.46494+07	2025-11-02 18:01:36.46494+07
d20b3edf-b115-4bc5-aafb-35146a58527c	aef50ffd-3d8b-449e-a8a8-ec2decc57c2b	Paket Tes Baru (V1.10)	1-5 Orang	30 Menit (15 Sesi + 15 Pilih)	- 2 Cetak 4R\n- Semua File	150000.00	per_package	30	2025-11-02 18:30:15.582926+07	2025-11-02 18:30:15.582926+07
\.


--
-- Data for Name: photos; Type: TABLE DATA; Schema: phourto; Owner: phourto_admin
--

COPY phourto.photos (photo_id, booking_id, file_key, file_url, file_name_original, file_size_bytes, mime_type, uploaded_at) FROM stdin;
18261f65-e625-4c39-ba49-dd4eb0b723c9	a34e95eb-8f94-499e-bf21-670db7bd047b	bookings/a34e95eb-8f94-499e-bf21-670db7bd047b/1762083450684-download.png	https://phototestingbucket.s3.ap-southeast-2.amazonaws.com/bookings/a34e95eb-8f94-499e-bf21-670db7bd047b/1762083450684-download.png	download.png	60792	image/png	2025-11-02 18:37:32.537349+07
\.


--
-- Data for Name: room_blocks; Type: TABLE DATA; Schema: phourto; Owner: phourto_admin
--

COPY phourto.room_blocks (block_id, room_id, start_time, end_time, reason, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: rooms; Type: TABLE DATA; Schema: phourto; Owner: phourto_admin
--

COPY phourto.rooms (room_id, branch_id, room_name_display, created_at, updated_at) FROM stdin;
58877723-d72a-4635-aa98-162b893538dc	f5534e4c-13d5-436a-9624-3705ef1fc989	Room 1 (Basic Plan)	2025-11-01 13:54:24.618397+07	2025-11-01 13:54:24.618397+07
799146e4-0931-4552-8184-767ad23d4cb7	f5534e4c-13d5-436a-9624-3705ef1fc989	Room 2 (Blue Purple/Fisheye)	2025-11-01 13:54:24.618397+07	2025-11-01 13:54:24.618397+07
90e90302-fc2e-49e4-99c3-cde40550b528	f5534e4c-13d5-436a-9624-3705ef1fc989	Room 3 (Blank Space / Spotlight)	2025-11-01 13:54:24.618397+07	2025-11-01 13:54:24.618397+07
9f13d4a6-0dea-495e-9da6-f1cc1cf0a1dd	c4e3d584-9123-49e9-b644-413db743ca33	Room 1 (Basic)	2025-11-01 13:54:24.618397+07	2025-11-01 13:54:24.618397+07
e81944df-c94b-422e-b132-82529f369e2a	c4e3d584-9123-49e9-b644-413db743ca33	Room 2 (Fisheye)	2025-11-01 13:54:24.618397+07	2025-11-01 13:54:24.618397+07
b3f136c7-03f8-41e7-81cf-65dc21302033	c4e3d584-9123-49e9-b644-413db743ca33	Room 3 (Elevator)	2025-11-01 13:54:24.618397+07	2025-11-01 13:54:24.618397+07
4ba0837f-60e8-4ca2-800d-d9ce8e195bc8	c4e3d584-9123-49e9-b644-413db743ca33	Room 4 (Blank Space / Spotlight)	2025-11-01 13:54:24.618397+07	2025-11-01 13:54:24.618397+07
aef50ffd-3d8b-449e-a8a8-ec2decc57c2b	f0bce5e9-4842-42cf-ad97-979c2d57cd32	Room 1 (Basic)	2025-11-01 13:54:24.618397+07	2025-11-01 13:54:24.618397+07
0a88cc8f-0046-4a48-a099-0a92be7cda50	f0bce5e9-4842-42cf-ad97-979c2d57cd32	Y2K Yearbook Concept	2025-11-01 13:54:24.618397+07	2025-11-01 13:54:24.618397+07
\.


--
-- Data for Name: users; Type: TABLE DATA; Schema: phourto; Owner: phourto_admin
--

COPY phourto.users (user_id, full_name, email, phone_number, password_hash, role, created_at, updated_at) FROM stdin;
06e2bad7-0256-4604-a70a-a0cc6cad6f86	Admin S.P.O.T	admin@phour.to	081234560001	$2a$10$QcPzoqZTuZxoyLfpImHVD.s3468u/1kf3ofZeJxZcIjhT2wGc7s4u	admin	2025-11-01 13:54:24.618397+07	2025-11-01 13:54:24.618397+07
a833ee06-7351-4339-941d-498bf6c67d1e	Citra Lestari	citra.lestari@email.com	081912345678	$2a$10$RQSJ5xXcvOF921QQ4XVILeEitWkDkfPv/oxIyA/S1LerIm/4hpbHq	customer	2025-11-01 13:54:24.618397+07	2025-11-01 13:54:24.618397+07
d1119370-4218-4c0b-94ac-5ac4dba9bd5b	Budi Santoso	budi.santoso@email.com	081211112222	$2b$10$GgJ/gxffuc7ioDMEdpvwNetrfR8Bg3tcMJtmXVUDm6XtG/HruBOee	customer	2025-11-01 13:54:24.618397+07	2025-11-02 18:37:32.872526+07
e42946b6-9f97-4fcc-b236-438092f42f6e	Andi Budiman	andi.budi@email.com	080987654321	$2a$10$zjpHgBHMvmprfbawlOidUeKwS9XtXymkRDtpLatITnpfFYJ4ZqzbG	customer	2025-11-01 14:11:23.267763+07	2025-11-03 09:59:19.066399+07
7f11bf3f-0a23-4183-9301-931603757512	Bahlil Lahlelah	sudah@email.com	081212345678	$2b$10$7dH3ktvN6/mehX9chJXuNuU71gXJSxqmnMg81leFpvK9dXJA9eE3q	customer	2025-11-02 18:37:28.891434+07	2025-11-03 10:09:03.125897+07
\.


--
-- Name: addons addons_pkey; Type: CONSTRAINT; Schema: phourto; Owner: phourto_admin
--

ALTER TABLE ONLY phourto.addons
    ADD CONSTRAINT addons_pkey PRIMARY KEY (addon_id);


--
-- Name: booking_addons booking_addons_pkey; Type: CONSTRAINT; Schema: phourto; Owner: phourto_admin
--

ALTER TABLE ONLY phourto.booking_addons
    ADD CONSTRAINT booking_addons_pkey PRIMARY KEY (booking_addon_id);


--
-- Name: booking_history booking_history_pkey; Type: CONSTRAINT; Schema: phourto; Owner: phourto_admin
--

ALTER TABLE ONLY phourto.booking_history
    ADD CONSTRAINT booking_history_pkey PRIMARY KEY (history_id);


--
-- Name: bookings bookings_payment_gateway_ref_key; Type: CONSTRAINT; Schema: phourto; Owner: phourto_admin
--

ALTER TABLE ONLY phourto.bookings
    ADD CONSTRAINT bookings_payment_gateway_ref_key UNIQUE (payment_gateway_ref);


--
-- Name: bookings bookings_pkey; Type: CONSTRAINT; Schema: phourto; Owner: phourto_admin
--

ALTER TABLE ONLY phourto.bookings
    ADD CONSTRAINT bookings_pkey PRIMARY KEY (booking_id);


--
-- Name: bookings bookings_unique_code_key; Type: CONSTRAINT; Schema: phourto; Owner: phourto_admin
--

ALTER TABLE ONLY phourto.bookings
    ADD CONSTRAINT bookings_unique_code_key UNIQUE (unique_code);


--
-- Name: branches branches_branch_name_key; Type: CONSTRAINT; Schema: phourto; Owner: phourto_admin
--

ALTER TABLE ONLY phourto.branches
    ADD CONSTRAINT branches_branch_name_key UNIQUE (branch_name);


--
-- Name: branches branches_pkey; Type: CONSTRAINT; Schema: phourto; Owner: phourto_admin
--

ALTER TABLE ONLY phourto.branches
    ADD CONSTRAINT branches_pkey PRIMARY KEY (branch_id);


--
-- Name: packages packages_pkey; Type: CONSTRAINT; Schema: phourto; Owner: phourto_admin
--

ALTER TABLE ONLY phourto.packages
    ADD CONSTRAINT packages_pkey PRIMARY KEY (package_id);


--
-- Name: photos photos_pkey; Type: CONSTRAINT; Schema: phourto; Owner: phourto_admin
--

ALTER TABLE ONLY phourto.photos
    ADD CONSTRAINT photos_pkey PRIMARY KEY (photo_id);


--
-- Name: room_blocks room_blocks_pkey; Type: CONSTRAINT; Schema: phourto; Owner: phourto_admin
--

ALTER TABLE ONLY phourto.room_blocks
    ADD CONSTRAINT room_blocks_pkey PRIMARY KEY (block_id);


--
-- Name: rooms rooms_pkey; Type: CONSTRAINT; Schema: phourto; Owner: phourto_admin
--

ALTER TABLE ONLY phourto.rooms
    ADD CONSTRAINT rooms_pkey PRIMARY KEY (room_id);


--
-- Name: users users_email_key; Type: CONSTRAINT; Schema: phourto; Owner: phourto_admin
--

ALTER TABLE ONLY phourto.users
    ADD CONSTRAINT users_email_key UNIQUE (email);


--
-- Name: users users_phone_number_key; Type: CONSTRAINT; Schema: phourto; Owner: phourto_admin
--

ALTER TABLE ONLY phourto.users
    ADD CONSTRAINT users_phone_number_key UNIQUE (phone_number);


--
-- Name: users users_pkey; Type: CONSTRAINT; Schema: phourto; Owner: phourto_admin
--

ALTER TABLE ONLY phourto.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (user_id);


--
-- Name: idx_addons_package_id; Type: INDEX; Schema: phourto; Owner: phourto_admin
--

CREATE INDEX idx_addons_package_id ON phourto.addons USING btree (package_id);


--
-- Name: idx_booking_addons_booking_id; Type: INDEX; Schema: phourto; Owner: phourto_admin
--

CREATE INDEX idx_booking_addons_booking_id ON phourto.booking_addons USING btree (booking_id);


--
-- Name: idx_booking_history_booking_id; Type: INDEX; Schema: phourto; Owner: phourto_admin
--

CREATE INDEX idx_booking_history_booking_id ON phourto.booking_history USING btree (booking_id);


--
-- Name: idx_bookings_package_id; Type: INDEX; Schema: phourto; Owner: phourto_admin
--

CREATE INDEX idx_bookings_package_id ON phourto.bookings USING btree (package_id);


--
-- Name: idx_bookings_room_time; Type: INDEX; Schema: phourto; Owner: phourto_admin
--

CREATE INDEX idx_bookings_room_time ON phourto.bookings USING btree (room_id, start_time, end_time, payment_status);


--
-- Name: idx_bookings_status_deadline; Type: INDEX; Schema: phourto; Owner: phourto_admin
--

CREATE INDEX idx_bookings_status_deadline ON phourto.bookings USING btree (payment_status, payment_deadline);


--
-- Name: idx_bookings_user_id; Type: INDEX; Schema: phourto; Owner: phourto_admin
--

CREATE INDEX idx_bookings_user_id ON phourto.bookings USING btree (user_id);


--
-- Name: idx_packages_room_id; Type: INDEX; Schema: phourto; Owner: phourto_admin
--

CREATE INDEX idx_packages_room_id ON phourto.packages USING btree (room_id);


--
-- Name: idx_photos_booking_id; Type: INDEX; Schema: phourto; Owner: phourto_admin
--

CREATE INDEX idx_photos_booking_id ON phourto.photos USING btree (booking_id);


--
-- Name: idx_room_blocks_room_time; Type: INDEX; Schema: phourto; Owner: phourto_admin
--

CREATE INDEX idx_room_blocks_room_time ON phourto.room_blocks USING btree (room_id, start_time, end_time);


--
-- Name: idx_rooms_branch_id; Type: INDEX; Schema: phourto; Owner: phourto_admin
--

CREATE INDEX idx_rooms_branch_id ON phourto.rooms USING btree (branch_id);


--
-- Name: addons set_timestamp; Type: TRIGGER; Schema: phourto; Owner: phourto_admin
--

CREATE TRIGGER set_timestamp BEFORE UPDATE ON phourto.addons FOR EACH ROW EXECUTE FUNCTION phourto.trigger_set_timestamp();


--
-- Name: bookings set_timestamp; Type: TRIGGER; Schema: phourto; Owner: phourto_admin
--

CREATE TRIGGER set_timestamp BEFORE UPDATE ON phourto.bookings FOR EACH ROW EXECUTE FUNCTION phourto.trigger_set_timestamp();


--
-- Name: branches set_timestamp; Type: TRIGGER; Schema: phourto; Owner: phourto_admin
--

CREATE TRIGGER set_timestamp BEFORE UPDATE ON phourto.branches FOR EACH ROW EXECUTE FUNCTION phourto.trigger_set_timestamp();


--
-- Name: packages set_timestamp; Type: TRIGGER; Schema: phourto; Owner: phourto_admin
--

CREATE TRIGGER set_timestamp BEFORE UPDATE ON phourto.packages FOR EACH ROW EXECUTE FUNCTION phourto.trigger_set_timestamp();


--
-- Name: room_blocks set_timestamp; Type: TRIGGER; Schema: phourto; Owner: phourto_admin
--

CREATE TRIGGER set_timestamp BEFORE UPDATE ON phourto.room_blocks FOR EACH ROW EXECUTE FUNCTION phourto.trigger_set_timestamp();


--
-- Name: rooms set_timestamp; Type: TRIGGER; Schema: phourto; Owner: phourto_admin
--

CREATE TRIGGER set_timestamp BEFORE UPDATE ON phourto.rooms FOR EACH ROW EXECUTE FUNCTION phourto.trigger_set_timestamp();


--
-- Name: users set_timestamp; Type: TRIGGER; Schema: phourto; Owner: phourto_admin
--

CREATE TRIGGER set_timestamp BEFORE UPDATE ON phourto.users FOR EACH ROW EXECUTE FUNCTION phourto.trigger_set_timestamp();


--
-- Name: addons addons_package_id_fkey; Type: FK CONSTRAINT; Schema: phourto; Owner: phourto_admin
--

ALTER TABLE ONLY phourto.addons
    ADD CONSTRAINT addons_package_id_fkey FOREIGN KEY (package_id) REFERENCES phourto.packages(package_id) ON DELETE CASCADE;


--
-- Name: booking_addons booking_addons_addon_id_fkey; Type: FK CONSTRAINT; Schema: phourto; Owner: phourto_admin
--

ALTER TABLE ONLY phourto.booking_addons
    ADD CONSTRAINT booking_addons_addon_id_fkey FOREIGN KEY (addon_id) REFERENCES phourto.addons(addon_id) ON DELETE RESTRICT;


--
-- Name: booking_addons booking_addons_booking_id_fkey; Type: FK CONSTRAINT; Schema: phourto; Owner: phourto_admin
--

ALTER TABLE ONLY phourto.booking_addons
    ADD CONSTRAINT booking_addons_booking_id_fkey FOREIGN KEY (booking_id) REFERENCES phourto.bookings(booking_id) ON DELETE CASCADE;


--
-- Name: booking_history booking_history_booking_id_fkey; Type: FK CONSTRAINT; Schema: phourto; Owner: phourto_admin
--

ALTER TABLE ONLY phourto.booking_history
    ADD CONSTRAINT booking_history_booking_id_fkey FOREIGN KEY (booking_id) REFERENCES phourto.bookings(booking_id) ON DELETE CASCADE;


--
-- Name: booking_history booking_history_user_id_actor_fkey; Type: FK CONSTRAINT; Schema: phourto; Owner: phourto_admin
--

ALTER TABLE ONLY phourto.booking_history
    ADD CONSTRAINT booking_history_user_id_actor_fkey FOREIGN KEY (user_id_actor) REFERENCES phourto.users(user_id) ON DELETE SET NULL;


--
-- Name: bookings bookings_package_id_fkey; Type: FK CONSTRAINT; Schema: phourto; Owner: phourto_admin
--

ALTER TABLE ONLY phourto.bookings
    ADD CONSTRAINT bookings_package_id_fkey FOREIGN KEY (package_id) REFERENCES phourto.packages(package_id) ON DELETE RESTRICT;


--
-- Name: bookings bookings_room_id_fkey; Type: FK CONSTRAINT; Schema: phourto; Owner: phourto_admin
--

ALTER TABLE ONLY phourto.bookings
    ADD CONSTRAINT bookings_room_id_fkey FOREIGN KEY (room_id) REFERENCES phourto.rooms(room_id) ON DELETE RESTRICT;


--
-- Name: bookings bookings_user_id_fkey; Type: FK CONSTRAINT; Schema: phourto; Owner: phourto_admin
--

ALTER TABLE ONLY phourto.bookings
    ADD CONSTRAINT bookings_user_id_fkey FOREIGN KEY (user_id) REFERENCES phourto.users(user_id) ON DELETE RESTRICT;


--
-- Name: packages packages_room_id_fkey; Type: FK CONSTRAINT; Schema: phourto; Owner: phourto_admin
--

ALTER TABLE ONLY phourto.packages
    ADD CONSTRAINT packages_room_id_fkey FOREIGN KEY (room_id) REFERENCES phourto.rooms(room_id) ON DELETE RESTRICT;


--
-- Name: photos photos_booking_id_fkey; Type: FK CONSTRAINT; Schema: phourto; Owner: phourto_admin
--

ALTER TABLE ONLY phourto.photos
    ADD CONSTRAINT photos_booking_id_fkey FOREIGN KEY (booking_id) REFERENCES phourto.bookings(booking_id) ON DELETE CASCADE;


--
-- Name: room_blocks room_blocks_room_id_fkey; Type: FK CONSTRAINT; Schema: phourto; Owner: phourto_admin
--

ALTER TABLE ONLY phourto.room_blocks
    ADD CONSTRAINT room_blocks_room_id_fkey FOREIGN KEY (room_id) REFERENCES phourto.rooms(room_id) ON DELETE CASCADE;


--
-- Name: rooms rooms_branch_id_fkey; Type: FK CONSTRAINT; Schema: phourto; Owner: phourto_admin
--

ALTER TABLE ONLY phourto.rooms
    ADD CONSTRAINT rooms_branch_id_fkey FOREIGN KEY (branch_id) REFERENCES phourto.branches(branch_id) ON DELETE RESTRICT;


--
-- PostgreSQL database dump complete
--

\unrestrict YoNqv73Yf3qbmUBr6ebdUzMd2sPMtl3R0HaL3VodU213RArS8jvmg5eojvjEPeh

--
-- Database "postgres" dump
--

\connect postgres

--
-- PostgreSQL database dump
--

\restrict QN88I9xl4Ei5TFOxIm2NQRlNjbbphWptM3wsPCYmJmgBq64L7fRTAmJXaCrBIvt

-- Dumped from database version 17.6
-- Dumped by pg_dump version 17.6

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- PostgreSQL database dump complete
--

\unrestrict QN88I9xl4Ei5TFOxIm2NQRlNjbbphWptM3wsPCYmJmgBq64L7fRTAmJXaCrBIvt

--
-- PostgreSQL database cluster dump complete
--

