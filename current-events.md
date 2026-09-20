# Current Events

## Document

### Tracked

```json
{
    "type": "document:tracked",
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
    "type": "document:untracked",
    "payload": {
        "id" : "document:id",
    }
}
```

## Resource

### Linked

```json
{
    "type": "resource:linked",
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
    "type": "resource:unlinked",
    "payload": {
        "id": "link:id",
    }
}
```
