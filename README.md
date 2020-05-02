# serverless-AWS
Example REST API using the serverless stack from AWS: **Lambda, DynamoDB, SAM, API Gateway**

- [serverless-AWS](#serverless-aws)
  - [Available endpoints:](#available-endpoints)
  - [Prerequisites](#prerequisites)
  - [How to deploy the API](#how-to-deploy-the-api)
    - [SAM configuration](#sam-configuration)
    - [SAM deploy](#sam-deploy)
  - [Short code overview](#short-code-overview)
    - [dbManager.js](#dbmanagerjs)
    - [Template.yaml](#templateyaml)
  - [Entities](#entities)
    - [Post](#post)
    - [Comment](#comment)
  - [Integration Tests](#integration-tests)
  - [Github Actions pipeline](#github-actions-pipeline)

## Available endpoints:
| Method | Resource                             |
| ------ |:------------------------------------:|
| GET    | /posts                               |
| GET    | /posts/{postId}                      |
| POST   | /posts                               |
| POST   | /posts/{postId}/comments             |
| PUT    | /posts/{postId}                      |
| DELETE | /posts/{postId}                      |
| DELETE | /posts/{postId}/comments/{commentId} |

## Prerequisites
In order to deploy this lambda application into you AWS environment, you will first need:
- AWS account (educate, free tier or normal)
- [SAM cli installed](https://docs.aws.amazon.com/serverless-application-model/latest/developerguide/serverless-sam-cli-install.html)
- [AWS credentials configured](https://docs.aws.amazon.com/sdk-for-java/v1/developer-guide/setup-credentials.html)

## How to deploy the API
### SAM configuration
You can manually create this file or use the command `sam deploy --guided` to interactively create it.

```
version = 0.1
[default]
[default.deploy]
[default.deploy.parameters]
stack_name = "serverless-aws"
s3_bucket = "s3.cloudapps.codeurjc"
s3_prefix = "serverless-aws"
region = "us-east-1"
capabilities = "CAPABILITY_IAM"
```

Important information here is the **S3 Bucket** where your code will get packaged to and it's prefix. Also the **region** in where your API will get deployed, and where your DynamoDB is, please notice lines 4 to 6 in `src/dbManager.js`:

```
AWS.config.update({
    endpoint: "https://dynamodb.us-east-1.amazonaws.com"
});
```
### SAM deploy
Once `samconfig.toml` is in place, you can already perform `sam deploy` and your lambda application sould get deployed in your AWS account. Thanks to the last line of the file `template.yaml`, the logs from deploy should at the very end print the prod url where the API is now available:

```
Value: !Sub "https://${ServerlessRestApi}.execute-api.${AWS::Region}.amazonaws.com/Prod/posts/"
```

Once deployed, feel free to use the provided **Postman** collection against the API.

## Short code overview
The key parts are `src/dbManager.js` and `template.yaml`.
### dbManager.js
This file first imports the node AWS sdk `const AWS = require('aws-sdk')` and creates a Dynamo DocumentClient `const docClient = new AWS.DynamoDB.DocumentClient()` to manage documents against the database on each lambda. Now retrieving a collection from a lambda would be as easy as:

```
const params = {
    TableName: 'posts'
};

return docClient.scan(params).promise();
```

A more complex example would be creating a comment within a Post comments collection: 
```
const params = {
    TableName: 'posts',
    Key: {
        "postid": postid
    },
    UpdateExpression: 'set comments.#commentid = :comment',
    ExpressionAttributeNames: {
        "#commentid": commentid
    },
    ExpressionAttributeValues: {
        ":comment": comment,
    },
    ReturnValues: "UPDATED_NEW"
};
return docClient.update(params).promise();
```

Notice as well the parameter `Returnalues` where what the API will return after the action is carried out

### Template.yaml
Defines a lambda function defining the events that will trigger this function, such as this piece of code:
```
lambdaGetPost:
  Type: Api
  Properties:
      Path: /posts/{postid}
      Method: GET
```
Will make a GET to the resource `/posts/{postid}` trigger our lambda application.

This template also defines one or more policies that this function needs. They will be appended to the default role for this function. This way:
```
Effect: Allow
Action:
    -   'dynamodb:Scan'
    -   'dynamodb:Query'
    -   'dynamodb:DeleteItem'
    -   'dynamodb:GetItem'
    -   'dynamodb:PutItem'
    -   'dynamodb:UpdateItem'
```

All these actions will be allowed over DynamoDB.

The second part of the yaml file, defines a **DynamoDB** table:
```
Type: 'AWS::DynamoDB::Table'
Properties:
    TableName: posts
    AttributeDefinitions:
        -   AttributeName: postid
            AttributeType: S
    KeySchema:
        -   AttributeName: postid
            KeyType: HASH
    ProvisionedThroughput:
        ReadCapacityUnits: 5
        WriteCapacityUnits: 5
```

## Entities
### Post
```
{
	"name": "Jack Nicholson",
	"nickname": "Nicky",
	"title": "My Joker was good too",
	"content": "Respect for Heath Ledger and Joaquin Phoenix",
	"comments": {}
}
```

### Comment
```
{
	"nickname": "Random Internet Guy",
	"comment": "Here is Johnny!",
	"creationDate": "2019-11-26 10:15:55"
}
```

## Integration Tests
Find inside directory `src/integrationtests` a straightforward postman collection, including test assertions, testing every endpoint and a main application flow:
1. Create a Post
2. Get all available Posts
3. Get a specific Post checking structure
4. Modify the Post's nickname
5. Get it again to check whether it was modified correctly
6. Add a Comment to the Post
7. Delete the Comment
8. Delete the Post

To run them, you have basically two options:
- Import the collection in Postman and run them manually
- Install Newman `npm install -g newman` and execute `npm run test:integration`

## Github Actions pipeline
A very simple actions pipeline is provided in this project too. The file `.github/workflows/ci.yml` will create a pipeline which will trigger the postman collection automatically using newman against the production url for the api:
```
integration_tests:
    name: Run integration tests
    runs-on: ubuntu-16.04
    steps:
    - uses: actions/checkout@master
    - uses: actions/setup-node@v1
      with:
        node-version: '12.x'
    - name: Install Newman
      run: npm install -g newman
    - name: Integration Tests
      run: cd src && npm run test:integration
```