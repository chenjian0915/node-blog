/**
 * Created by ChenJian on 2017/11/29.
 */
var mongodb = require('./db');

function Comment(name,day,title,comment){
    this.name    = name;
    this.day     = day;
    this.title   = title;
    this.comment = comment;
};

module.exports = Comment;

Comment.prototype.save = function(callback){
    console.log()
    var name    = this.name;
    var day     = this.day;
    var title   = this.title;
    var comment = this.comment;

    //打开数据库
    mongodb.open(function(err,db){
        if(err){
            return callback(err);
        }
        console.log(111111111111111111111)
        db.collection('posts',function(err,collection){
            if(err){
                mongodb.close();
                return callback(err);
            }
            console.log(111111111111111111111)
            console.log(comment)
            collection.update({
                'name' : name ,
                'title.day' : day ,
                'title' : title
            },{
                $push : {'comments':comment}
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