const xml2js = require('xml2js');

function convertXmlToJson(xmlString) {
  let jsonObject = null;
  xml2js.parseString(xmlString, (err, result) => {
    if (err) {
      throw err;
    }
    jsonObject = result;
  });
  return jsonObject;
}

module.exports = {
  convertXmlToJson,
};