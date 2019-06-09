const express = require('express');
const router=express.Router();
const Post=require('../../models/Post');
const Category=require('../../models/Category');
const Comment=require('../../models/Comment');
const faker = require('faker');
const {userAuthenticated}=require('../../helpers/authentication');

router.all('/*',(req,res,next)=>{
  req.app.locals.layout='admin';
  next();
});


router.get('/',(req,res)=>{
  let promises=[
    Post.count().exec(),
    Category.count().exec(),
    Comment.count().exec(),
  ];
  Promise.all(promises).then(([postCount,categoryCount,commentCount])=>{
    res.render('admin/index',{postCount:postCount,categoryCount:categoryCount,commentCount:commentCount});
  });
});

router.post('/generate-fake-posts',(req,res)=>{
  for (var i = 0; i < req.body.amount; i++) {
    const post=new Post();
    post.title=faker.name.title();
    post.status='public';
    post.slug=faker.name.title();
    post.allowComments=faker.random.boolean();
    post.body=faker.lorem.sentence();
    post.save(function(err){
      if(err) throw err;
    });
  }
  res.redirect('/admin/posts');
});

module.exports=router;
