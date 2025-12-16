# NGAO-MIS Deployment & Runbook (Summary)

## Overview
Components:
- PostgreSQL + PostGIS (primary)
- API Gateway / Microservices
- Object Storage (S3)
- Message Queue (Kafka/RabbitMQ)
- Backups & Monitoring (pgBackRest / Prometheus + Grafana)

## Database Deployment (quick)
1. Start PostGIS using Docker Compose (see below).
2. Initialize DB extensions (uuid-ossp, postgis).
3. Load schema: `psql -U ngaouser -d ngaomis -f ngao_schema.sql`
4. Load triggers: `psql -U ngaouser -d ngaomis -f ngao_sp_triggers.sql`
5. Create partitions & materialized views.

## Backups
- Use pgBackRest or similar; schedule daily full backups and WAL shipping.

## Monitoring
- Monitor replication lag, query duration, disk usage.

## Security
- Enforce TLS, use database roles, rotate credentials quarterly.

## Archival
- Partition old data monthly and archive to S3 using ETL script.
