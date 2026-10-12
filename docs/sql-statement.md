## SQL Statements

## Tables

### Request (request)

```sql
CREATE TABLE request (
    idx INTEGER PRIMARY KEY AUTOINCREMENT,
    id TEXT NOT NULL,
    description TEXT NOT NULL,
    due_date TEXT,
    status TEXT NOT NULL DEFAULT 'pending'
);
```

### Responsibility (responsibility)

```sql
CREATE TABLE responsibility (
    idx INTEGER PRIMARY KEY AUTOINCREMENT,
    id TEXT NOT NULL,
    name TEXT NOT NULL,
    description TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending'
);
```

### Role (role)

```sql
CREATE TABLE role (
    idx INTEGER PRIMARY KEY AUTOINCREMENT,
    id TEXT NOT NULL,
    name TEXT NOT NULL,
    description TEXT NOT NULL
);
```

### Role Responsibility (role_responsibility)

```sql
CREATE TABLE role_responsibility (
    id TEXT NOT NULL,
    source TEXT NOT NULL,
    destination TEXT NOT NULL
);
```

### Responsibility Request (responsibility_request)

```sql
CREATE TABLE responsibility_request (
    id TEXT NOT NULL,
    source TEXT NOT NULL,
    destination TEXT NOT NULL
);
```

### Query

#### Find Requests where ID

```sql
    select * from request where id = ?
```

#### Find Responsibility where ID

```sql
    select * from responsibility where id = ?
```

#### Find Role where ID

```sql
    select * from role where id = ?
```

#### Find Requests associated with Responsibility

```sql
    select * from role where id = ?
```

### Insert

### Update

### Delete
