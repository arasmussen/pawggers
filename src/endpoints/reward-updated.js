module.exports = function(request, response) {
  console.log('received reward-updated request');
  const data = request.postData;
  console.log(data);
  response.writeHead(200, { 'Content-Type': 'application/json' });
  response.end(data.challenge);
}
