# Production Disaster Recovery & Schema Migration Strategy
**QR Business Catalog SaaS Platform**

---

## 1. Supabase Production Database Backups
- **Automatic Point-in-Time Recovery (PITR)**: Enable PITR in the Supabase Dashboard (`Database -> Backups`).
- **Daily Automated Backups**: Retain at least 7–30 days of automated daily Postgres dumps.
- **Manual Pre-Deployment Export**: Before running manual DDL or migration scripts, generate a full logical backup using `pg_dump`:
  ```bash
  pg_dump -h db.<PROJECT-REF>.supabase.co -U postgres -d postgres -F c -b -v -f pre_deploy_backup.dump
  ```

---

## 2. Storage & Asset Safety
- **Bucket Identification**: All customer images (logos, banners, catalog product photos) reside in the `business-assets` public storage bucket.
- **Tenant Path Isolation**: Object keys strictly follow `{business_id}/{filename}` format.
- **Backup Recommendation**: Enable Supabase Storage daily backups or mirror object keys to S3/Cloud Storage. Never run bulk delete operations on the `storage.objects` table.

---

## 3. Migration Procedure
- All production schema updates **MUST** use idempotent SQL scripts located under `supabase/migrations/`.
- **Migration Rules**:
  1. Always use `CREATE TABLE IF NOT EXISTS`, `ALTER TABLE ... ADD COLUMN IF NOT EXISTS`, `CREATE INDEX IF NOT EXISTS`.
  2. Functions must use `CREATE OR REPLACE FUNCTION`.
  3. **NEVER** issue `DROP TABLE`, `TRUNCATE`, or `CASCADE` commands on production.
  4. Test migrations against a local or staging Supabase project before applying to production.

---

## 4. Emergency Rollback Procedure
If a migration or bad deployment disrupts production service:
1. Re-deploy the last known stable Git commit (`git checkout <stable-commit-hash>`).
2. Restore database state from the pre-deployment backup or Supabase Dashboard PITR snapshot:
   ```bash
   pg_restore -h db.<PROJECT-REF>.supabase.co -U postgres -d postgres -v -c pre_deploy_backup.dump
   ```
3. Issue schema cache reload signal to PostgREST:
   ```sql
   NOTIFY pgrst, 'reload schema';
   ```

---

## 5. Dangerous Commands — DO NOT RUN DIRECTLY ON PRODUCTION
- 🚫 `DROP TABLE public.businesses CASCADE;`
- 🚫 `TRUNCATE public.catalog_items;`
- 🚫 `DELETE FROM auth.users;`
- 🚫 `ALTER TABLE public.businesses DROP COLUMN owner_id;`
