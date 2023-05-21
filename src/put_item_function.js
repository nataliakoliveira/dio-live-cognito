const AWS = require('aws-sdk');
const dynamodb = new AWS.DynamoDB.DocumentClient();

exports.handler = async (event) => {
  let responseBody = '';
  let statusCode = 0;

  let { id, price } = JSON.parse(event.body);

  if (!id || !price) {
    statusCode = 400;
    responseBody = JSON.stringify('Parâmetros inválidos');
  } else {
    const params = {
      TableName: 'Items',
      Item: {
        id: id,
        price: price
      }
    };

    try {
      await dynamodb.put(params).promise();
      statusCode = 200;
      responseBody = JSON.stringify({ message: 'Item inserido com sucesso!', id: id });
    } catch (err) {
      if (err.name === 'ValidationException') {
        statusCode = 400;
        responseBody = JSON.stringify('Erro de validação');
      } else if (err.name === 'ProvisionedThroughputExceededException') {
        statusCode = 503;
        responseBody = JSON.stringify('Capacidade de provisionamento excedida');
      } else {
        statusCode = 500;
        responseBody = JSON.stringify('Erro interno do servidor');
      }
    }
  }

  const response = {
    statusCode: statusCode,
    body: responseBody
  };

  return response;
};
