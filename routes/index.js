var express = require('express');
var router = express.Router();
var crypto = require('crypto');
var User = require('../modules/user.js');
var Post = require('../modules/post.js');
var Comment = require('../modules/comments.js');


/* GET home page. */
module.exports = function(app){
  app.get('/',function(req,res){
    Post.getAll(null,function(err,posts){
      if(err){
        posts = [];
      }
      res.render(
          'index' , {
            'title':'主页',
            user : req.session.user,
            success : req.flash('success').toString(),
            posts : posts,
            error : req.flash('error').toString()
          }
      )
    })
  });
  app.get('/reg',checkNotLogin);
  app.get('/reg',function(req,res){
    res.render(
        'reg' , {
          title:'注册',
          user : req.session.user,
          success : req.flash('success').toString(),
          error : req.flash('error').toString()
        }
    )
  });
  app.post('/reg',checkNotLogin);
  app.post('/reg',function(req,res){
    var name = req.body.name;
    var password = req.body.password;
    var password_re = req.body['password-repeat'];
    if(password!==password_re){
      req.flash('error','两次输入密码不一致!');
      return res.redirect('/reg');
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
      console.log(user)
      if(user){
        req.flash('error','用户已经存在!');
        return res.redirect('/reg');//返回注册页面
      }
      newUser.save(function(err,user){
        console.log(err)
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
  app.get('/login',checkNotLogin);
  app.get('/login',function(req,res){
    res.render(
        'login' , {
          title:'登录',
          user : req.session.user,
          success : req.flash('success').toString(),
          error : req.flash('error').toString()

        }
    )
  });
  app.post('/login',checkNotLogin);
  app.post('/login',function(req,res){
    //生成密码的md5值
    var md5 = crypto.createHash('md5');
    var password = md5.update(req.body.password).digest('hex');
    User.get(req.body.name,function(err,user){
      if(!user){
        req.flash('error','用户不存在');
        return res.redirect('/login');
      }
      //检查密码一致
      if(user.password!=password){
        req.flash('error','密码错误');
        return res.redirect('/login');
      }
      //用户名和密码匹配后存入Session
      req.session.user = user;
      req.flash('success','登录成功!');
      res.redirect('/');

    })
  });
  app.get('/post',checkLogin);
  app.get('/post',function(req,res){
    res.render(
        'post' , {
          'title':'发表',
          'user' : req.session.user,
          'success' : req.flash('success').toString(),
          'error' : req.flash('error').toString()
        }
    )
  });
  app.post('/post',checkLogin);
  app.post('/post',function(req,res){
    var currentUser = req.session.user;
    var post = new Post(currentUser.name,req.body.title,req.body.post);
    post.save(function(err){
      if(err){
        req.flash('error',err);
        return res.redirect('/');
      }
      req.flash('success','发布成功');
      res.redirect('/');
    })
  });
  app.get('/edit/:name/:day/:title',checkLogin);
  app.get('/edit/:name/:day/:title',function(req,res){
    var currentUser = req.session.user;
    Post.edit(currentUser.name,req.params.day,req.params.title,function(err,post){
      if(err){
        req.flash('error',err);
        res.redirect('/');
      }
      res.render('edit',{
        title : '编辑文章',
        post : post,
        user : req.session.user,
        'success' : req.flash('success').toString(),
        'error' : req.flash('error').toString()
      })
    })
  });
  app.post('/edit/:name/:day/:title',checkLogin);
  app.post('/edit/:name/:day/:title',function(req,res){
    var currentUser = req.session.user;
    Post.update(currentUser.name,req.params.day,req.params.title,req.body.post,function(err){
      var url = '/u/'+ currentUser.name +'/'+req.params.day+'/'+req.params.title;
      if(err){
        req.flash('error',err);
        return res.redirect(url);
      }
      req.flash('success','修改成功!');
      res.redirect(url);
    })
  });
  app.get('/remove/:name/:day/:title',checkLogin);
  app.get('/remove/:name/:day/:title',function(req,res){
    var currentUser = req.session.user;
    Post.remove(currentUser.name,req.params.day,req.params.title,function(err){
      if(err){
        req.flash('error',err);
        return res.redirect('/');
      }
      req.flash('success','删除成功');
      res.redirect('/');
    })
  });

  app.get('/logout',checkLogin);
  app.get('/logout',function(req,res){
    req.session.user = null;
    req.flash('success','退出成功');
    res.redirect('/');
  });
  app.get('/u/:name',function(req,res){
    //检查用户是否存在
    User.get(req.params.name,function(err,user){
      if(!user){
        req.flash('error','用户不存在!');
        return res.redirect('/');
      }
      //查询并返回文章
      Post.getAll(user.name,function(err,posts){
        if(err){
          req.flash('error',err);
          return res.redirect('/');
        }
        res.render('user',{
          title : user.name,
          posts : posts,
          user : req.session.user,
          success : req.flash('success').toString(),
          error : req.flash('error').toString(),
        });
      });
    });
  });
  app.get('/u/:name/:day/:title',function(req,res){
    Post.getOne(req.params.name,req.params.day,req.params.title,function(err,post){
      if(err){
        req.flash('error',err);
        return res.redirect('/');
      }res.render('article',{
        title : req.params.title,
        post : post ,
        user : req.session.user,
        success : req.flash('success').toString(),
        error : req.flash('error').toString()
      })
    });
  });
  app.post('/u/:name/:day/:title',function(req,res){
    var date = new Date();
    var time = date.getFullYear() + '-' + (date.getMonth()+1) + '-' + date.getDate() + ' ' + date.getHours() + ':' + date.getMinutes();
    var comment = {
      name : req.body.name,
      email : req.body.email,
      website : req.body.website,
      time : time,
      content : req.body.content
    };
    var newComment = new Comment(req.params.name,req.params.day,req.params.title,comment);
    newComment.save(function(err){
      if(err){
        req.flash('error',err);
        return res.redirect('back');
      }
      req.flash('success','留言成功了!')
      res.redirect('back');
    })
  });


  //判断登录状态
  function checkLogin(req,res,next){
    if(!req.session.user){
      req.flash('error','未登录');
      res.redirect('/login');
    }
    next();
  }
  function checkNotLogin(req,res,next){
    if(req.session.user){
      req.flash('error','已登录');
      res.redirect('/');
    }
    next();
  }
};
