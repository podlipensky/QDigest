/*
 * QDigest - implementation of q-digest data structure from paper: http://www.inf.fu-berlin.de/lehre/WS11/Wireless/papers/AgrQdigest.pdf
 * @data - array of items
 * @k - compression parameter (the bigger k, less space tree will take and bigger error will be)
 * @sigma - number of distinct possible elements in a data set
 */
define([], function() {

// Log base 2 helper
var log2 = function (n) {
    return Math.log(n) / Math.log(2);
};

var QDigest = function (data, k, sigma) {
    this.dataSize = data.length;

    var dict = {};

    for (var i = 0; i < this.dataSize; i++) {
        if (!dict.hasOwnProperty(data[i])) {
            dict[data[i]] = 0;
        }

        dict[data[i]]++;
    }
    // build complete binary tree with at least sigma leaves
    this.tree = this.buildCompleteTree(dict, sigma);
    this.digestParam = Math.floor(this.dataSize / k);
    this.compressTree(this.dataSize, k);
};

/*
 * Build complete binary tree on all possible values from range 0..sigma
 * @data - dict of items frequencies
 */
QDigest.prototype.buildCompleteTree = function (data, sigma) {
    var height = Math.ceil(log2(sigma)) + 1;  // height of the tree
    var length = Math.pow(2, height) - 1;  // number of nodes in a tree
    var leavesCount = Math.pow(2, height-1);
    var tree = new Array(length);

    // fill up values for leaves
    var i = length - leavesCount;  // index of first leaf

    for (var j = 0; j < sigma; j++) {
        if (data.hasOwnProperty(j)) {
            tree[i+j] = data[j];
        }
    }

    return tree;
};

/*
 * @n - total number of items observed
 * @k - compression parameter
 */
QDigest.prototype.compressTree = function () {
    // go level-by-level starting from the deepest nodes and merge nodes containing unsufficient amount of information
    var height = Math.floor(log2(this.tree.length)) + 1;
    var leavesCount = Math.pow(2, height - 1);

    this.compressTreeHelper(0, leavesCount-1, 0);
};

QDigest.prototype.obeyDigestProp1 = function (i) {
    // Total count of items in a given range/node should be smaller or equal to n/k, so
    // the error on query response will be bounded by log(sigma, 2) * n / k.
    // This rule will be true by construction. But it still could be useful for tree validation.
    return this.tree[i] <= this.digestParam;
};

QDigest.prototype.obeyDigestProp2 = function (i) {
    // If two children of the node contain too small counts, then they should be merged into parent
    var node = this.tree[i] || 0;
    var left = this.tree[2 * i + 1] || 0;
    var right = this.tree[2 * i + 2] || 0;

    return node + left + right > this.digestParam;
};

/*
 * @i - index of current node in a tree to compress
 * @low - low value of range covered by node i
 * @high - high value of range covered by node i
 */
QDigest.prototype.compressTreeHelper = function (low, high, i) {
    if (low >= high) {
        // no changes for leaves
        return;
    }

    var leftIdx = i * 2 + 1;
    var rightIdx = i * 2 + 2;
    var middle = low + ((high - low) >> 1);

    this.compressTreeHelper(low, middle, leftIdx);
    this.compressTreeHelper(middle+1, high, rightIdx);

    // if node i has two children with too small values - merge them into the node
    if (!this.obeyDigestProp2(i)) {

        var left = this.tree[leftIdx] || 0;
        var right = this.tree[rightIdx] || 0;

        this.tree[i] = left + right;
        this.tree[leftIdx] = 0;
        this.tree[rightIdx] = 0;
    }
};

/*
 * Convert tree into array of tuples [i, j] where i - index of a node and j - value at this node
 */
QDigest.prototype.serialize = function () {
    var result = [];
    for (var i = 0, len = this.tree.length; i < len; i++) {
        if (this.tree[i]) {
            result.push([i, this.tree[i]]);
        }
    }

    return result;
};

/*
 * Returns value of the biggest item in first n*m items of sorted data array
 */
QDigest.prototype.quantile = function (m) {
    var maxCount = this.dataSize * m;
    var count = 0;
    var node = 0;
    var stack = [];
    var len = this.tree.length;

    var leftIdx, rightIdx, lastNode;

    // perform post-order walk and stop once cumulative sum of counts overcome maxCount
    while (node < len || stack.length) {
        if (node < len) {
            leftIdx = 2 * node + 1;
            rightIdx = 2 * node + 2;

            stack.push(rightIdx);
            stack.push(node);

            node = leftIdx;
        } else {
            node = stack.pop();
            rightIdx = 2 * node + 2;

            if (stack.length && stack[stack.length-1] === rightIdx) {
                stack.pop();
                stack.push(node);

                node = rightIdx;
            } else {
                if (count + this.tree[node] >= maxCount) {
                    break;
                }
                count += this.tree[node];
                lastNode = node;
                node = len;
            }
        }
    }
    // convert node index into value from range 0..sigma
    var height = Math.floor(log2(this.tree.length)) + 1;
    var level = 0;
    while ((1 << level) < node) {
        level += 1;
    }
    var idx = node - (1<<(level-1)) + 1;  // node index on the level
    var levelStep = 1 << (height-level);  // each node represents levelStep items in it
    var value = levelStep * idx;

    return value;
};

return QDigest;

});
