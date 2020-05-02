const uuid = require('uuid');
const AWS = require('aws-sdk');

AWS.config.update({
    endpoint: "https://dynamodb.us-east-1.amazonaws.com"
});

const docClient = new AWS.DynamoDB.DocumentClient();
const table = 'posts';

const getAllPosts = () => {
    const params = {
        TableName: table
    };

    return docClient.scan(params).promise();
};

const getPost = (postid) => {
    const params = {
        TableName: table,
        KeyConditionExpression: 'postid = :id',
        ExpressionAttributeValues: {
            ':id': postid
        }
    };

    return docClient.query(params).promise();
};

const addPost = (data) => {
    const params = {
        TableName: table,
        Item: {
            "postid": uuid.v1(),
            "name": data.name,
            "nickname": data.nickname,
            "title": data.title,
            "content": data.content,
            "comments": data.comments
        }
    };

    return docClient.put(params).promise();
};

const addComment = (postid, data) => {
    const commentid = uuid.v1();
    const comment = {
        "nickname": data.nickname,
        "creationDate": data.creationDate,
        "comment": data.comment
    };

    const params = {
        TableName: table,
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
};

const updatePost = (data) => {
    const params = {
        TableName: table,
        Key: {
            "postid": data.postid
        },
        UpdateExpression: "set #na = :na, nickname = :ni, title = :ti, content = :co, comments = :cs",
        ExpressionAttributeNames: {
            "#na": 'name'
        },
        ExpressionAttributeValues: {
            ":na": data.name,
            ":ni": data.nickname,
            ":ti": data.title,
            ":co": data.content,
            ":cs": data.comments
        },
        ReturnValues: "UPDATED_NEW"
    };

    return docClient.update(params).promise();
};

const deletePost = (postid) => {
    const params = {
        TableName: table,
        Key: {
            "postid": postid
        },
        ConditionExpression: "postid = :postid",
        ExpressionAttributeValues: {
            ":postid": postid
        }
    };

    return docClient.delete(params).promise();
};

const deleteComment = (postid, commentid) => {
    const params = {
        TableName: table,
        Key: {
            "postid": postid
        },
        UpdateExpression: 'remove comments.#commentid',
        ExpressionAttributeNames: {
            "#commentid": commentid
        },
        ReturnValues: "ALL_NEW"
    };
    return docClient.update(params).promise();
};

module.exports = {
    getAllPosts,
    getPost,
    addPost,
    addComment,
    updatePost,
    deletePost,
    deleteComment
};