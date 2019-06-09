const express = require('express');
const router=express.Router();
const fs = require('fs');
const Post = require('../../models/Post');
const Category = require('../../models/Category');
const {isEmpty,uploadDir}=require('../../helpers/upload-helpers');
router.all('/*',(req,res,next)=>{
  req.app.locals.layout='admin';
  next();
});

router.get('/',(req,res)=>{
  Post.find({})
  .populate('category')
  .then(posts=>{
    res.render('admin/posts',{posts:posts});
  });
});

router.get('/create',(req,res)=>{
  Category.find({}).then(categories=>{
      res.render('admin/posts/create',{categories:categories});
  });
});

router.get('/my-posts',(req,res)=>{
  Post.find({user:req.user.id})
  .populate('category')
  .then(posts=>{
    res.render('admin/posts/my-posts',{posts:posts});
  });
});

router.get('/edit',(req,res)=>{
  res.render('admin/posts/edit');
});
router.get('/edit/:id',(req,res)=>{
  Post.findOne({_id:req.params.id}).then(post=>{
    Category.find({}).then(categories=>{
      res.render('admin/posts/edit',{post:post,categories:categories});
    });

  });
});

router.put('/edit/:id',(req,res)=>{
  Post.findOne({_id:req.params.id}).then(post=>{
    let allowedComments=false;
    let filename='';
    if(req.body.allowComments){
      allowedComments=true;
    }else {
      allowedComments=false;
    }
    if(!isEmpty(req.files)) {
      console.log('welcome to edit');
      let file=req.files.file;
      filename=Date.now()+'-'+file.name;
      file.mv('./public/uploads/'+filename,(err)=>{
        if(err) throw err;
      });
    }
    post.user=req.user.id;
    post.title=req.body.title;
    post.status=req.body.status;
    post.category=req.body.category;
    post.allowComments=allowedComments;
    post.body=req.body.body;
    post.file=filename;
    post.save().then(savedPost=>{

      req.flash('success_message','Post was updated successfully');
      res.redirect('/admin/posts/my-posts');
    });
  });
});

router.delete('/:id',(req,res)=>{
  Post.findOne({_id:req.params.id}).populate('comments').then(post=>{
    console.log('deleted');
    console.log(post.comments);
    fs.unlink(uploadDir+post.file,(err)=>{
      post.comments.forEach(comment=>{
        comment.remove();
      });
        post.remove(removedPost=>{
          req.flash('success_message','Post was deleted successfully');
          res.redirect('/admin/posts/my-posts');
        });
    });
  });
});
router.post('/create',(req,res)=>{
  let errors=[];

  if (!req.body.title) {
    errors.push({message:'please add a title'});
  }
  if (!req.body.body) {
    errors.push({message:'please add a description'});
  }
  if (errors.length>0) {
    res.render('admin/posts/create',{errors:errors});
  }else {
    let filename='';
    if (!isEmpty(req.files)) {
      let file=req.files.file;
      filename=Date.now()+'-'+file.name;
      file.mv('./public/uploads/'+filename,(err)=>{
        if(err) throw err;
      });
      console.log('not empty');
    }else {
      console.log('empty');
    }

    let allowedComments=false;
    if(req.body.allowComments){
      allowedComments=true;
    }else {
      allowedComments=false;
    }
    const newPost=new Post({
        user:req.user.id,
        title:req.body.title,
        status:req.body.status,
        allowComments:allowedComments,
        body:req.body.body,
        category:req.body.category,
        file:filename
    });
    newPost.save().then(savedPost=>{
      console.log(savedPost);
      req.flash('success_message','Post was created Sucessfully');
      res.redirect('/admin/posts');
    }).catch(error=>{
      console.log(error);
    });
  }
});
module.exports=router;
