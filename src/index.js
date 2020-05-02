'use strict';

const dbManager = require('./dbManager');

exports.postsHandler = (event, context, callback) => {
    switch (event.httpMethod) {
        case 'GET':
            if (event.pathParameters && event.pathParameters.postid) {
                getPost(event.pathParameters.postid, callback);
            } else {
                getAllPosts(callback);
            }
            break;
        case 'POST':
            if (event.pathParameters && event.pathParameters.postid) {
                addComment(event.pathParameters.postid, event.body, callback);
            } else {
                addPost(event.body, callback);
            }
            break;
        case 'PUT':
            updatePost(event.pathParameters.postid, event.body, callback);
            break;
        case 'DELETE':
            if (event.pathParameters.commentid) {
                deleteComment(event.pathParameters.postid, event.pathParameters.commentid, callback);
            } else {
                deletePost(event.pathParameters.postid, callback);
            }
            break;
        default:
            sendResponse(400, `Unsupported method ${event.httpMethod}`, callback);
    }
};

const getAllPosts = (callback) => {
    dbManager.getAllPosts()
        .then((res) => {
            sendResponse(200, res, callback);
        })
        .catch((err) => {
            console.log(err);
            sendResponse(200, err, callback);
        });
};

const getPost = (postid, callback) => {
    dbManager.getPost(postid)
        .then((res) => {
            sendResponse(200, res, callback);
        })
        .catch((err) => {
            console.log(err);
            sendResponse(200, err, callback);
        });
};

const addPost = (data, callback) => {
    data = JSON.parse(data);

    dbManager.addPost(data)
        .then((res) => {
            sendResponse(200, res, callback);
        })
        .catch((err) => {
            console.log(err);
            sendResponse(200, err, callback);
        });
};

const addComment = (commentid, data, callback) => {
    data = JSON.parse(data);

    dbManager.addComment(commentid, data)
        .then((res) => {
            sendResponse(200, res, callback);
        })
        .catch((err) => {
            console.log(err);
            sendResponse(200, err, callback);
        });
};

const updatePost = (postid, data, callback) => {
    data = JSON.parse(data);
    data.postid = postid;

    dbManager.updatePost(data)
        .then((res) => {
            sendResponse(200, res, callback);
        })
        .catch((err) => {
            console.log(err);
            sendResponse(200, err, callback);
        });
};

const deletePost = (postid, callback) => {
    dbManager.deletePost(postid)
        .then((res) => {
            sendResponse(200, res, callback);
        })
        .catch((err) => {
            console.log(err);
            sendResponse(200, err, callback);
        });
};

const deleteComment = (postid, commentid, callback) => {
    dbManager.deleteComment(postid, commentid)
        .then((res) => {
            sendResponse(200, res, callback);
        })
        .catch((err) => {
            console.log(err);
            sendResponse(200, err, callback);
        });
};

const sendResponse = (statusCode, message, callback) => {
    const res = {
        statusCode: statusCode,
        body: JSON.stringify(message)
    };
    callback(null, res);
};