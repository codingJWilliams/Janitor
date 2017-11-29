module.exports = function(target, replacement) {
  return this.split(target).join(replacement);
};
