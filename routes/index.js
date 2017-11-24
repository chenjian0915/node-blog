var express = require('express');
var router = express.Router();
var crypto = require('crypto');
var User = require('../modules/user.js');


/* GET home page. */
module.exports = function(app){
  app.get('/',function(req,res){
    res.render(
        'index' , {'title':'Express'}
    )
  });
  app.get('/reg',function(req,res){
    res.render(
        'reg' , {'title':'注册'}
    )
  });
  app.post('/reg',function(req,res){
    var name = req.body.name;
    var password = req.body.password;
    var password_re = req.body['password-repeat'];
    if(password!==password_re){
      req.flash('error','两次输入密码不一致!');
    };
    //生成密码的md5值
    var md5 = crypto.createHash('md5');
    var password = md5.update(req.body.password).digest('hex');
    var newUser = new User({
      name : name,
      password:password,
      email : req.body.email
    });
    //检查用户是否已经存在
    User.get(newUser.name,function(err,user){
      if(user){
        req.flash('error','用户已经存在!');
        return res.redirect('/reg');//返回注册页面
      }
      newUser.save(function(err,user){
        if(err){
          req.flash('err',err);
          return res.redirect('/reg');
        }
        req.session.user = user;
        req.flash('success','注册成功');
        res.redirect('/');//注册成功后返回主页
      });
    });
  });
  app.get('/login',function(req,res){
    res.render(
        'login' , {'title':'登录'}
    )
  });
  app.post('/login',function(req,res){
    res.render(
        'index' , {'title':'Express'}
    )
  });
  app.get('/post',function(req,res){
    res.render(
        'post' , {'title':'发表'}
    )
  });
  app.post('/post',function(req,res){

  });
  app.get('/logout',function(req,res){

  });


}
