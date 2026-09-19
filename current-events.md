# Current Events

## Document Tracked

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


## Resource Linked

```json
{
    "type": "resource:linked",
    "payload": {
        "edge-one": "document:id",
        "edge-two": "tag:id"
    }
}
```
