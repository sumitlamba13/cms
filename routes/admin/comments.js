const express = require('express');
const router=express.Router();
const Post=require('../../models/Post');
const Comment=require('../../models/Comment');

router.get('/',(req,res)=>{
  Comment.find({user:req.user.id}).populate('user').then(comments=>{
      res.render('admin/comments',{comments:comments});
  });

});


router.post('/',(req,res)=>{
  Post.findOne({_id:req.body.id}).then(post=>{
    const newComment=new Comment({
      user:req.user.id,
      body:req.body.body
    });
    post.comments.push(newComment);
    post.save().then(savedPost=>{
      console.log(savedPost);
      newComment.save().then(savedComment=>{
        console.log(req.body.body);
        req.flash('success_message','Your comment will be reviewed');
        res.redirect(`/post/${post.id}`);
      });
    });
  });
});

router.delete('/:id',(req,res)=>{
  Comment.remove({_id:req.params.id}).then(deleteitem=>{
    res.redirect('/admin/comments');
  });
});


router.post('/approve-comment',(req,res)=>{
  Comment.findByIdAndUpdate(req.body.id,{$set:{approveComment:req.body.approveComment}},(err,result)=>{
    if (err) {
      return err;
    }
    res.send(result);
  });
});
module.exports=router;
