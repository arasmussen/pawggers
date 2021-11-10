module.exports = function(request, response) {
  const data = request.postData;
  response.writeHead(200, { 'Content-Type': 'application/json' });
  response.end(data.challenge);
}