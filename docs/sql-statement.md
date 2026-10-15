# Generic

## Generic Query

### Find the lastest entry that contains idx

```sql
    SELECT idx FROM ${table}
    ORDER BY idx DESC
    LIMIT 1;
```

# Tables

## Request (request)

### Table Create

```sql
CREATE TABLE request (
    idx INTEGER PRIMARY KEY AUTOINCREMENT,
    id TEXT NOT NULL,
    description TEXT NOT NULL,
    due_date TEXT,
    status TEXT NOT NULL DEFAULT 'pending'
);
```

### Query

#### Find Requests where ID

```sql
    select * from request where id = ?
```

## Responsibility (responsibility)

### Table Create

```sql
CREATE TABLE responsibility (
    idx INTEGER PRIMARY KEY AUTOINCREMENT,
    id TEXT NOT NULL,
    name TEXT NOT NULL,
    description TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending'
);
```

### Query

#### Find Responsibility where ID

```sql
    select * from responsibility where id = ?
```

## Role (role)

### Table Create

```sql
CREATE TABLE role (
    idx INTEGER PRIMARY KEY AUTOINCREMENT,
    id TEXT NOT NULL,
    name TEXT NOT NULL,
    description TEXT NOT NULL
);
```

### Insert

```sql
    INSERT INTO ${table} (id, name, description)
    VALUES (?, ?, ?);
```

### Query

#### Find Role where ID

```sql
    select * from role where id = ?
```

## Role Responsibility (role_responsibility)

### Table Create

```sql
CREATE TABLE role_responsibility (
    id TEXT NOT NULL,
    source TEXT NOT NULL,
    destination TEXT NOT NULL
);
```

## Responsibility Request (responsibility_request)

### Table Create

```sql
CREATE TABLE responsibility_request (
    id TEXT NOT NULL,
    source TEXT NOT NULL,
    destination TEXT NOT NULL
);
```
