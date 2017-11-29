/**
 * Created by ChenJian on 2017/11/28.
 */
var mongodb = require('./db');
var Post = function(name,title,post){
    this.name = name;
    this.title = title;
    this.post = post;
};

module.exports = Post;

//存储一篇文章 及相关信息
Post.prototype.save = function(callback){
    var date = new Date();
    var time = {
        date   : date,
        year   : date.getFullYear(),
        month  : date.getFullYear() + '-' + (date.getMonth()+1),
        day    : date.getFullYear() + '-' + (date.getMonth()+1) + '-' + date.getDate(),
        minute : date.getFullYear() + '-' + (date.getMonth()+1) + '-' + date.getDate() + ' ' + date.getHours() + ':' + date.getMinutes()
    };
    var post = {
        name  : this.name,
        time  : time,
        title : this.title,
        post  : this.post,
        comments : []
    };
    //打开数据库
    mongodb.open(function(err,db){
        if(err){
            return callback(err);
        };
        //读取posts集合
        db.collection('posts',function(err,collection){
            if(err){
                mongodb.close();
                return callback(err);
            }
            //将文章插入posts
            collection.insert(post,{safe:true},function(err){
                mongodb.close();
                if(err){
                    return callback(err);
                }
                callback(null);
            });
        });
    });

};

Post.getAll = function(name,callback){
    //打开数据库
    mongodb.open(function(err,db){
        if(err){
            return callback(err);
        }
        db.collection('posts',function(err,collection){
            if(err){
               mongodb.close();
               return callback(err);
            }
            var query = {};
            if(name){
                query.name = name;
            }
            collection.find(query).sort({time:-1}).toArray(function(err,docs){
                mongodb.close();
                if(err){
                    return callback(err);
                }
                callback(null,docs);
            });

        });
    })
};

Post.getOne = function(name,day,title,callback){
    //打开数据库
    mongodb.open(function (err,db) {
        if(err){
           return callback(err);
        }
        //读取posts集合
        db.collection('posts',function (err,collection) {
            if(err){
                mongodb.close();
                return callback(err);
            }
            collection.findOne({
                name : name ,
                'time.day' : day,
                title : title
            },function(err,doc){
                mongodb.close();
                if(err){
                    callback(err);
                }
                callback(null,doc);
            })
        });

    });
};

Post.edit = function(name,day,title,callback){
    mongodb.open(function(err,db){
        if(err){
            return callback(err);
        }
        db.collection('posts',function(err,collection){
            if(err){
                mongodb.close();
                return callback(err);
            }
            //根据信息检索文章
            collection.findOne({
                name : name ,
                'time.day' : day,
                title : title
            }, function (err,doc) {
                mongodb.close();
                if(err){
                    return callback(err);
                }
                callback(null,doc);
            })
        })
    });
}

Post.update = function(name,day,title,post,callback){
    mongodb.open(function (err,db) {
        if(err){
            return callback(err);
        }
        console.log(post)
        db.collection('posts', function (err,collection) {
            if(err){
                mongodb.close();
                return callback(err);
            }
            collection.update({
                name : name ,
                'time.day' : day ,
                title : title
            },{
                $set : {post : post}
            },function(err){
                mongodb.close();
                if(err){
                    return callback(err);
                }
                callback(null);
            })
        })
    });
};

Post.remove = function(name,day,title,callback){
    mongodb.open(function (err,db) {
        if(err){
            mongodb.close();
            return callback(err);
        }
        db.collection('posts',function(err,collection){
            if(err){
                mongodb.close();
                return callback(err)
            }
            collection.remove({
                'name':name,
                'time.day':day,
                'title':title
            },{
                w : 1
            }, function (err) {
                mongodb.close();
                if(err){
                    return callback(err);
                }
                callback(null);
            })
        })
    })
};
























