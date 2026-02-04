// Polyfill for Array.prototype.toReversed() (ES2023)
// Required for Node.js < 20 compatibility with Metro bundler
if (!Array.prototype.toReversed) {
  Array.prototype.toReversed = function() {
    return [...this].reverse();
  };
}
