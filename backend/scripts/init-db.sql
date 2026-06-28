-- One-time bootstrap (run as a Postgres superuser)
-- psql postgres -f backend/scripts/init-db.sql

CREATE DATABASE chefai_rag;

\c chefai_rag

CREATE EXTENSION IF NOT EXISTS vector;
