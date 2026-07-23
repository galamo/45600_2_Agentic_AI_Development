# Lab 30: MySQL Cars & Owners

Docker Compose MySQL database with seed data for **users**, **cars**, and **user_cars** (ownership).

Init scripts under `init/` are mounted into `/docker-entrypoint-initdb.d` and run automatically on **first** container start (empty volume).

## Quick start

```bash
cd lab_30
docker compose up -d
```

Wait until healthy:

```bash
docker compose ps
```

## Connection

| Setting  | Value        |
|----------|--------------|
| Host     | `localhost` (or `host.docker.internal` from another Docker container / n8n) |
| Port     | `3306`       |
| Database | `car_owners` |
| User     | `lab30`      |
| Password | `lab30pass`  |
| Root     | `root` / `rootpass` |

```bash
docker exec -it lab30-mysql mysql -ulab30 -plab30pass car_owners
```

Example queries:

```sql
SHOW TABLES;
SELECT COUNT(*) FROM users;
SELECT u.first_name, c.make, c.model, uc.ownership_role
FROM user_cars uc
JOIN users u ON u.id = uc.user_id
JOIN cars c ON c.id = uc.car_id
LIMIT 10;
```

## Schema

- `users` — people (name, email, city, …)
- `cars` — vehicles (make, model, year, VIN, plate, …)
- `user_cars` — ownership links (`owner` / `co_owner` / `lessee`)

## Reset data

Init scripts only run on a fresh data volume. To re-seed:

```bash
docker compose down -v
docker compose up -d
```

## Stop

```bash
docker compose down
```
