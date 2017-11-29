var mongodb = require('./db');

function User(user){
    this.name = user.name;
    this.password = user.password;
    this.email = user.email;
}

module.exports = User;

//存储用户信息
User.prototype.save = function(callback){
    //要存入的数据库的用户数据
    var user = {
        name : this.name,
        password : this.password,
        email : this.email
    };

    //打开数据库
    mongodb.open(function(err,db){
        if(err){
            return callback(err); //错误,返回err信息
        }
        //读取users集合
        db.collection('users',function(err,collection){
            if(err){
                mongodb.close();
                return callback(err);//错误,返回err信息
            }
            collection.insert(user,{
                safe:true
            },function(err,user){
                mongodb.close();
                if(err){
                    return callback(err);
                }
                callback(null,user.ops[0]);
                //callback(null,user[0]);  express3
            })
        });
    });


};

User.get = function(name,callback){
    //打开数据库
    mongodb.open(function(err,db){
        if(err){
            return callback(err);
        }
        //读取users集合
        db.collection('users',function(err,collection){
            if(err){
               mongodb.close();
               return callback(err);
            }
            //查找用户名(name键)值为name一个文档
            collection.findOne({
                name : name
            },function(err,user){
                mongodb.close();
               if(err){
                   return callback(err);
               }
                callback(null,user);//成功,返回查询的用户信息
            });

        });
    });
};
