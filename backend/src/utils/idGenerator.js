exports.generateId = (prefix) => {
  return prefix + Math.floor(100000000 + Math.random() * 900000000);
};