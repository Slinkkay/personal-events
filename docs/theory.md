# Theory

When making a decision or viewing content of some sort the most relevant 
information is typically the information which is more current or recently
reviewed. This tends to make only the current state of something the only
thing which is stored and persisted for the long term. How the state was
derived or manifested tends to be secondary to that information. However,
more often than not the history of how that derivation or manifestation is
 needed to either update that item or to build alternative views of that 
 information. 

## Example

Imagine attempting to find the next time to do an oil change on a car. The 
content would display the last time the oil was changed along with the current
mileage on the car. This is easy information to capture at a single point in
time and store it as is.

```json
{
    "lastOilChange": "2019-09-20",
    "mileage": 7500
}
```

However, at the same time if your mechanic then asks you when was the last time
that the coolant was replaced or the tires rotated. This would require adding
the last rotation date along with the last coolant replaced dates and updating
the content to display it. 

If in the future there is a question around how often the car oil was changed
at the proper schedule. With the data that was provided originally the only 
information that you could discern would be the last time the oil was changed.
So hopefully the last few views of this content were stored somewhere and 
checking versions against those items you might be able to re-create the 
information you need. 

The original content you wanted to view is perfectly valid and is information 
that you need. However, only storing the content that you need has lost data 
and has made it difficult to get new requests in the future.
