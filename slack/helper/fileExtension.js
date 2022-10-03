exports.getExtension = (filename) => {
  const parts = filename.split('.');
  return parts[ parts.length - 1 ];
};

exports.getFileName = (filename) => {
  const parts = filename.split(".");
  return parts[ 0 ];
};