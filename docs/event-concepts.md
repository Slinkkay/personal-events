# Event Concepts

## Persisted Events

Each event should have the following information stored with each event. 

```json
{
    "timestamp": "2026-09-20T02:49:08.547Z",
    "sequence": 0,
    "namespace": "document",
    "type": "tracked",
    "payload": {} | null
}
```

### Property Breakdown

**timeStamp**

Identifies when the event was properly stored for persistence. The intent of this
value is to be able to identify the exact time an event was stored. This will 
allow for replays up to a specific time or even just debug a system around 
when events have occcured. 

**sequence**

Identifies the order in which the events have been stored. This is to isolate events
when different events have the exact same timestamp which event one occurs before 
the next one.

**namespace**

This is the top most tier of event types. This is to assist in giving some natural 
organization around the event types. This value can be empty if the user feels that
a top level namespace isn't needed.

**type**

This is the most specific thing that can identify the event. The language around this
work is **suggested** to be in the past tense. As events should be things that occured
in the pass. 

**payload**

This is the null or typed contents of the event. This contains the properties that are
captured in order to properly view and apply the events which have been raised.
 