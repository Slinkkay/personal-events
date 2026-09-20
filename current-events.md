# Current Events

## Document

### Tracked

```json
{
    "timestamp": "2026-09-20T02:49:08.547Z",
    "sequence": 0,
    "namespace": "document",
    "type": "tracked",
    "payload": {
        "id" : "document:id",
        "uri": "https://drive.google.com/some-location"
    }
}
```

Identifies a document which should be tracked


### Untracked

Removes a document from being tracked.

```json
{
    "timestamp": "2026-09-20T02:49:08.547Z",
    "sequence": 0,
    "namespace": "document",
    "type": "untracked",
    "payload": {
        "id" : "document:id",
    }
}
```

## Resource

### Linked

```json
{
    "timestamp": "2026-09-20T02:49:08.547Z",
    "sequence": 0,
    "namespace": "resource",
    "type": "linked",
    "payload": {
        "id": "link:id",
        "edge-one": "document:id",
        "edge-two": "tag:id"
    }
}
```

### Unlinked
```json
{
    "timestamp": "2026-09-20T02:49:08.547Z",
    "sequence": 0,
    "namespace": "resource",
    "type": "unlinked",
    "payload": {
        "id": "link:id",
    }
}
```
