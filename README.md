# QDigest
QDigest data structure for answering approximate quantile queries.
Although statistical analysis (like find top k visited urls) usually done on the server side (which makes a lot of sense), this particular data structure could be really useful on client side as well.
For example, if you want to find top k elements user hovered during his session. One approach would be to count hovers on all elements and send an array to the server. But it will be a lot of data, and most likely big part of it will be just noise. So this is the part where QDigest comes into play - we can not only find top k elements for current session, but also compress the data and send it to the server (where we can answer top-k query for all sessions).
Please read the paper about [QDigest properties and error calculations](http://www.inf.fu-berlin.de/lehre/WS11/Wireless/papers/AgrQdigest.pdf)

# Usage
- Clone the repo
- QDigest implemented as `require.js` module and represented as binary tree. In order to create an instance you need to pass an array of data items. For simplicity let's assume it will be numbers in some range `sigma`. Also range max value - `sigma` (assume the minimum is 0). And pass `k` parameter - defines the compression level (the bigger `k`, the less memory QDigest will take and the bigger error will be):

```
var q = new QDigest([0,2,2,2,2,3,3,3,3,3,3,4,5,6,7], 8, 5);
// find the median of the array
console.log(q.quantile(0.5));  // outputs 3
```

# Run Tests
- install bower `npm install bower`
- install depending modules (mostly for tests) `bower install`
- open `tests/testsrunner.html`
