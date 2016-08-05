/**
 * Created by HP on 16-Jul-16.
 */
// all the login modal stuff
    $("#login_button").click(function(){
        $("#myModalLabel").html("Login")
        $.ajax({
            url:'/blog/login/',
            type:'get',
            success:function(data)
            {
                $("#form_place").html(data)
                $('#myModal').modal('toggle')
            }

        })

    }

    )

    $("#signup_button").click(function(){
        $("#myModalLabel").html("SignUp")
        $.ajax({
            url:'/blog/add_user/',
            type:'get',
            success:function(data)
            {
                $("#form_place").html(data)
                $('#myModal').modal('toggle')
            }

        })

    }

    )




var Blog = Backbone.Model.extend({
    urlRoot :  function(method,model,options)
    {
        if(options)
            return this.url
        else
            return "/blog/api/all_blogs/"
    },
    initialize :function(attributes,options)
    {
        if(options) {
            if(options.url){
            this.urlRoot = options.url}
        }

    },
    default : {
        title : "new title",
        content : "new content"
    }
});
Blog.bind('remove',function()
{
    this.destroy()
})
var Comment = Backbone.Model.extend({
    urlRoot : '/blog/api/all_comments/',
    default:{
        comment : 'new comment',
        id : 1
    }
});
Comment.bind('remove',function()
{
    this.destroy()
})
var Comment1 = Backbone.Model.extend({
    urlRoot : '/blog/api/edit_comments/',
    default : {
        comment:'edit comment',
        id : 1
    }
})
Comment1.bind('remove',function()
{
    this.destroy()
})
var User = Backbone.Model.extend({
    urlRoot : '/blog/api/all_users/'
})
var Friend = Backbone.Model.extend({
    urlRoot : '/blog/api/add_friend/'
})
var Users = Backbone.Collection.extend({
    model : User,
    url:'/blog/api/all_users/'
})

var Likes = Backbone.Model.extend({
    urlRoot:'/blog/api/likes/',
    default:{
        id:1,
        likes:0
    }
})
var Comments = Backbone.Collection.extend({
    url : function() {
     return '/blog/api/all_comments/'+this.id
    },
    model : Comment,
    initialize : function(models,options)
    {
        this.id = options.id

        this.fetch();
    }
})

var Blogs = Backbone.Collection.extend({

     url :function(){
         if(this.id)
         return "/blog/api/all_blogs/"+this.id
         return "/blog/api/all_blogs/"
     },
     model : Blog,
    initialize: function(model,options)
    {
        if(options)
        {
            this.id = options.id
            if(options.name)
                this.name = options.name
        }

        this.fetch();
    }
})
var my_blogs = new Blogs()
var my_blog = new Blog()
var all_users = new Users()
var BlogView = Backbone.View.extend({
    initialize :function() {
        var self = this
        var my_blog
        my_blogs.fetch({
            success: function () {
                my_blogs.models.forEach(function(model)
                {
                    temp_comments = new Comments([],{id:model.attributes.id})
                    temp_comments.fetch({
                        success:function(data)
                        {
                            model.attributes.comments = data
                            self.render2(data,model.attributes.id)
                        }
                    })

                    temp_like = new Likes({id:model.attributes.id})
                    temp_like.fetch({
                        success:function(data1)
                        {
                            $("#blog_like"+model.attributes.id).val(data1.attributes.like_count+" Like")

                        }
                        ,
                        error:function(error1)
                        {
                            console.log(error1)
                        }


                    })

                })

                self.render()
            }
        })

    },
    render : function()
    {
        var variables = {blogs : my_blogs.models}
        var template = _.template($("#blog_template").html(),variables)
        this.$el.html(template)

    },remove: function() {
      this.$el.empty().off(); /* off to unbind the events */

      return this;
    },
    render2 : function(comments,blog_id)
    {
        var variables = {comments : comments.models}
        var template = _.template($("#comment_template").html(),variables)
        $("#comment_div"+blog_id).html(template)
    },
    events:
    {
        'click .add_comment': 'addComment',
        'click .add_blog':'addBlog',
        'click .like':'Like',
        'click .clickable':'removeComment',
        'click .editable':'editComment',
        'click .save':'saveComment',
        'click .close':'editBlog',
        'click .delete':'deleteBlog',
        'click .saveBlog':'saveBlog'
    },
    addComment:function(event) {
        var self = this
        var name = '#' + $(event.target).data('id')
        if ($(name).val() != '')
        {
            comment = new Comment({comment: $(name).val(), id: $(event.target).data('blog_id')})
            model = my_blogs.get({id: $(event.target).data('blog_id')})
            comment.save({},
                {
                    success: function (data) {
                        temp_comments = new Comments([], {id: model.attributes.id})
                        temp_comments.fetch({
                            success: function (data) {
                                model.attributes.comments = data
                                self.render2(data, model.attributes.id)
                                $(name).val = ''
                            }
                        })

                    },
                    error:function(error)
                    {
                        console.log(error)
                    }

                })

            $(name).val('')
        }
    },
    addBlog:function(event) {
        var self = this
        if($("#title").val()!='' && $("#content").val()!='')
        {
            temp_blog = new Blog()
            temp_blog.attributes.title =$("#title").val()
            temp_blog.attributes.content = $("#content").val()
            temp_blog.save({},{
                success:function(model,response)
        {
            self.initialize()
        },error:function(model,response){
            console.log(response)
        }})
        }
    },
    Like : function(event)
    {
        id = $(event.target).data('blog_id')
        like = new Likes({id:parseInt(id)})
        like.save({},{success:function()
        {
            model = my_blogs.get({id: $(event.target).data('blog_id')})
            temp_like = new Likes({id:model.attributes.id})

                    temp_like.fetch({
                        success:function(data1)
                        {
                            $("#blog_like"+model.attributes.id).val(data1.attributes.like_count+" Like")

                        }
                        ,
                        error:function(error1)
                        {
                            console.log(error1)
                        }


                    })
        }})
    },
    removeComment : function(event)
    {
        var name = $(event.target).data('comment_id')
        var comment = '#comment_'+name
        var db_comment = my_blogs.get($(event.target).data('blog_id')).attributes.comments.get(name)
        db_comment.destroy({
            success:function()
            {
                var comments = my_blogs.get($(event.target).data('blog_id')).attributes.comments
                comments.remove(db_comment)
                $(comment).hide(400)
            },
            error:function(error)
            {
                console.log(error)
            }

        })
    },
    editComment:function(event)
    {
        var name = $(event.target).data('comment_id')
        console.log(name)
        var comment = '#comment_content_'+name
        $('#new_comment').data('blog_id',$(event.target).data('blog_id'))
        $('#new_comment').data('comment_id',name)
        $("#new_comment").val($(comment).html())
        $("#addComment").modal('toggle')
    },
    saveComment:function(event)
    {
        var new_val = $("#new_comment").val()
        var comment =  my_blogs.get($('#new_comment').data('blog_id')).attributes.comments.get($("#new_comment").data('comment_id'))
        console.log(comment.id)
        temp_comment = new Comment1({comment:new_val,id:comment.id})
        temp_comment.save({},{
            success:function()
            {
                $("#addComment").modal('hide')
                $("#comment_content_"+comment.id).html(new_val)
            }
        })


    },
    editBlog:function(event)
    {
        var blog_id = $(event.target).data("blog_id")
        $("#editTitle").val($("#blog_title_"+blog_id).html().trim())
        $("#editContent").val($("#blog_content_"+blog_id).html().trim())
        $.ajax({
        success: function (result) {
            $("#editBlog").attr('data-blog_id', blog_id);
            $("#editBlog").modal('toggle')
        }
         });
    },
    deleteBlog:function(event)
    {
        var blog_id = $("#editBlog").data('blog_id')
        blog = my_blogs.get(blog_id)
        blog = new Blog({id:blog.attributes.id},{url:'/blog/api/edit_blog/'})
        blog.destroy({
            success:function(){
                my_blogs.remove(blog)
                $("#editBlog").modal('hide')
                $("#blog_"+blog_id).hide(300)
            }
        })
    },
    saveBlog:function(event)
    {
        if($("#editTitle").val() != "" && $("#editContent").val()!= "")
        {
            var blog_id = $("#editBlog").data('blog_id')
            var old_blog = my_blogs.get(blog_id)
            var new_blog = new Blog({id: old_blog.attributes.id}, {title: $("#editTitle").val()}, {content: $("#editContent").val()}, {url: '/blog/api/edit_blog/'})
            new_blog.save({}, {
                success: function () {
                    $("#blog_title_" + blog_id).html($("#editTitle").val())
                    $("#blog_content_"+blog_id).html($("#editContent").val())
                    $("#editBlog").modal('hide')
                }

            })
        }
        else {
            $("#editBlogErrors").html("Fill the fields Correctly!!")
        }

    }
})

var blog_view ;

var FriendView = Backbone.View.extend({
    initialize:function()
    {
        var self = this
        all_users.fetch({
            success:function(users)
            {
                self.render_users(users.models)
                users.models.forEach(function(user)
                {
                    user.attributes.friend = false

                    $.ajax({
                        url:'/blog/api/check_friend/',
                        type:'post',
                        data: user.attributes,
                        success:function(res)
                        {
                            if(res == '1')
                                user.attributes.friend = true
                            else
                                user.attributes.friend = false
                            self.update(user)
                        },
                        error:function(res)
                        {
                            console.log("Something's not right!refresh the page")
                        }
                        })
                })


            },error:function(data)
            {
                console.log("error")
            }
        })
    },
    events : {
        'click .friend_change':'friend_change'
    },
     render_users : function(users)
    {
        var variables = {users : users}
        var template = _.template($("#friends_template").html(),variables)
        this.$el.html(template)
    },
    update:function(user)
    {
        if(user.attributes.friend == true)
            $("#friend"+user.attributes.id).html("Remove friend")
        else
            $("#friend"+user.attributes.id).html("Add friend")
    },
    friend_change : function (event) {
        var id = $(event.target).data('id')
        friend = all_users.get(id)
        $.ajax({
            url:'/blog/api/add_friend/',
            type:'POST',
            data:friend.attributes,
            success : function(data)
            {
               if(data == 1)
                   $(event.target).html('Remove Friend')
                else
                   $(event.target).html('Add Friend')
                blog_view.initialize()
            },error:function(data)
            {

            }
        })
    }


})


var Logged_in = Backbone.Model.extend({
    urlRoot:'/blog/api/auth_user/'
})
var auth_user = new Logged_in()
var UserView = Backbone.View.extend({
    initialize:function()
    {
        var self = this
        //get the number of posts
        all_users.fetch({
            success:function(users) {
                console.log(users)
                 users.models.forEach(function(user)
                {
                    user.attributes.friend = false
                    $.ajax({
                        url:'/blog/api/check_friend/',
                        type:'post',
                        data: user.attributes,
                        success:function(res)
                        {
                            if(res == '1')
                                user.attributes.friend = true
                            else
                                user.attributes.friend = false
                            //self.update()
                        },
                        error:function(res)
                        {
                            console.log("Something's not right!refresh the page")
                        }
                        })
                })
                auth_user.fetch({
                    success: function () {
                        self.render()
                        auth_user.attributes.followed_by.forEach(
                            function (model) {
                                model.friend = false
                                $.ajax({
                                    url: '/blog/api/check_friend/',
                                    type: 'post',
                                    data: model.user,
                                    success: function (res) {
                                        if (res == '1') {
                                            $("#followed_" + model.user.id).html("unfollow")
                                            model.friend = true
                                        }
                                        else
                                            $("#followed_" + model.user.id).html("follow")


                                    },
                                    error: function (res) {
                                        console.log("Something's not right!refresh the page")
                                    }
                                })

                            })

                    }

                })
            },error:function(data)
            {
                console.log("error")
            },

        })

    },
    render:function()
    {
        var variables = {auth_user : auth_user.attributes}
        var template = _.template($("#user_template").html(),variables)
        this.$el.html(template)
    },remove: function() {
      this.$el.empty().off(); /* off to unbind the events */

      return this;
},
    events:{
        'click #people_link': 'openPeopleModal',
        'click .unfollow':'friend_change'
    },
    openPeopleModal:function()
    {

        auth_user.attributes.followed_by.forEach(function(model){
            model.friend = false
            $.ajax({
                        url:'/blog/api/check_friend/',
                        type:'post',
                        data: model.user,
                        success:function(res)
                        {
                            if(res == '1')
                               $("#followed_"+model.user.id).html("unfollow")
                            else
                               $("#followed_"+model.user.id).html("follow")


                        },
                        error:function(res)
                        {
                            console.log("Something's not right!refresh the page")
                        }
                        })
        })

        this.render_people()
        $("#friends_modal").modal('show')


    },
    render_people : function()
    {
        var variables  = {following: auth_user.attributes.following,followed_by:auth_user.attributes.followed_by}
        var template = _.template($("#friends_modal_content").html(),variables)
        $("#people_place").html(template)
    },
    friend_change : function (event) {
        var self = this
        var id = $(event.target).data('friend_id')
        friend = all_users.get(id)
        console.log(all_users)
        $.ajax({
            url:'/blog/api/add_friend/',
            type:'POST',
            data:friend.attributes,
            success : function(data)
            {
                data1 = data
                auth_user.fetch({
                    success:function(data)
                    {
                        self.render_people()
                        $("#following_heading").html("Following "+auth_user.attributes.following.length+" | Followeb By "+ auth_user.attributes.followed_by.length)
                        if(data1 == 1)
                            $("#followed_"+id).html("unfollow")
                        else
                            $("#followed_"+id).html("follow")
                        blog_view.initialize()
                        //self.render()
                    },
                    error:function(data)
                    {
                       // self.render()
                    }

                })

            }
            ,error:function(data)
            {

            }
        })
    }
})

var new_auth = new Logged_in()

var PeopleView = Backbone.View.extend({
    initialize:function()
    {
        var self = this
        all_users.fetch({
            success:function(users) {
                console.log(users)
                 users.models.forEach(function(user)
                {
                    user.attributes.friend = false
                    $.ajax({
                        url:'/blog/api/check_friend/',
                        type:'post',
                        data: user.attributes,
                        success:function(res)
                        {
                            if(res == '1')
                                user.attributes.friend = true
                            else
                                user.attributes.friend = false
                            self.update()
                        },
                        error:function(res)
                        {
                            console.log("Something's not right!refresh the page")
                        }
                        })
                })
                new_auth.fetch({
                    success: function () {
                        self.render()
                        new_auth.attributes.followed_by.forEach(
                            function (model) {
                                model.friend = false
                                $.ajax({
                                    url: '/blog/api/check_friend/',
                                    type: 'post',
                                    data: model.user,
                                    success: function (res) {
                                        if (res == '1') {
                                            $("#followed_" + model.user.id).html("unfollow")
                                            model.friend = true
                                        }
                                        else
                                            $("#followed_" + model.user.id).html("follow")


                                    },
                                    error: function (res) {
                                        console.log("Something's not right!refresh the page")
                                    }
                                })

                            })

                    }

                })
            },error:function(data)
            {
                console.log("error")
            },

        })
    },
    events : {
        'click .unfollow': 'friendChange'
    },
    update : function()
    {

    },remove: function() {
      this.$el.empty().off(); /* off to unbind the events */

      return this;
},
    render:function()
    {

        console.log('rendered people view')
        var variables = {users:all_users.models,following : new_auth.attributes.following,followed_by:new_auth.attributes.followed_by}
        var template = _.template($("#people_template").html(),variables)
        $("#main_view").html(template)
        console.log($("#main_view"))
    },
    friendChange : function (event) {
        var self = this
        var id = $(event.target).data('friend_id')
        friend = all_users.get(id)
        if(friend)
        $.ajax({
            url:'/blog/api/add_friend/',
            type:'POST',
            data:friend.attributes,
            success : function(data)
            {
                data1 = data
                self.initialize()

            }
            ,error:function(data)
            {

            }
        })
    }

})


//profile view 

var ProfileView = Backbone.View.extend({
    initialize :function(options) {
        var self = this
        var my_blog
        if (options)
            this.name = this.options.name
        my_blogs = new Blogs([],{id:self.id})
        my_blogs.fetch({
            success: function () {
                my_blogs.models.forEach(function(model)
                {
                    temp_comments = new Comments([],{id:model.attributes.id})
                    temp_comments.fetch({
                        success:function(data)
                        {
                            model.attributes.comments = data
                            self.render2(data,model.attributes.id)
                        }
                    })

                    self.render()
                    temp_like = new Likes({id:model.attributes.id})
                    temp_like.fetch({
                        success:function(data1)
                        {
                            $("#blog_like"+model.attributes.id).val(data1.attributes.like_count+" Like")

                        }
                        ,
                        error:function(error1)
                        {
                            console.log(error1)
                        }


                    })

                })

            }
        })

    },
    render : function()
    {
        console.log('rendered profile view')
        var variables = {blogs : my_blogs.models,name:this.name}
        var template = _.template($("#profile_template").html(),variables)
        this.$el.html(template)

    },
    render2 : function(comments,blog_id)
    {
        var variables = {comments : comments.models}
        var template = _.template($("#comment_template").html(),variables)
        $("#comment_div"+blog_id).html(template)
    },
    remove: function() {
      this.$el.empty().off(); /* off to unbind the events */
      return this;
    },
    Like : function(event)
    {
        id = $(event.target).data('blog_id')
        like = new Likes({id:parseInt(id)})
        like.save({},{success:function()
        {
            model = my_blogs.get({id: $(event.target).data('blog_id')})
            temp_like = new Likes({id:model.attributes.id})

                    temp_like.fetch({
                        success:function(data1)
                        {
                            $("#blog_like"+model.attributes.id).val(data1.attributes.like_count+" Like")

                        }
                        ,
                        error:function(error1)
                        {
                            console.log(error1)
                        }


                    })
        }})
    },
    removeComment : function(event)
    {
        var name = $(event.target).data('comment_id')
        var comment = '#comment_'+name
        var db_comment = my_blogs.get($(event.target).data('blog_id')).attributes.comments.get(name)
        db_comment.destroy({
            success:function()
            {
                var comments = my_blogs.get($(event.target).data('blog_id')).attributes.comments
                comments.remove(db_comment)
                $(comment).hide(400)
            },
            error:function(error)
            {
                console.log(error)
            }

        })
    },
    editComment:function(event)
    {
        var name = $(event.target).data('comment_id')
        console.log(name)
        var comment = '#comment_content_'+name
        $('#new_comment').data('blog_id',$(event.target).data('blog_id'))
        $('#new_comment').data('comment_id',name)
        $("#new_comment").val($(comment).html())
        $("#addComment").modal('toggle')
    },
    saveComment:function(event)
    {
        var new_val = $("#new_comment").val()
        var comment =  my_blogs.get($('#new_comment').data('blog_id')).attributes.comments.get($("#new_comment").data('comment_id'))
        console.log(comment.id)
        temp_comment = new Comment1({comment:new_val,id:comment.id})
        temp_comment.save({},{
            success:function()
            {
                $("#addComment").modal('hide')
                $("#comment_content_"+comment.id).html(new_val)
            }
        })


    },
    addComment:function(event) {
        var self = this
        var name = '#' + $(event.target).data('id')
        if ($(name).val() != '')
        {
            comment = new Comment({comment: $(name).val(), id: $(event.target).data('blog_id')})
            model = my_blogs.get({id: $(event.target).data('blog_id')})
            comment.save({},
                {
                    success: function (data) {
                        temp_comments = new Comments([], {id: model.attributes.id})
                        temp_comments.fetch({
                            success: function (data) {
                                model.attributes.comments = data
                                self.render2(data, model.attributes.id)
                                $(name).val = ''
                            }
                        })

                    },
                    error:function(error)
                    {
                        console.log(error)
                    }

                })

            $(name).val('')
        }
    },
    events:
    {
        'click .add_comment': 'addComment',
        'click .like':'Like',
        'click .clickable':'removeComment',
        'click .editable':'editComment',
        'click .save':'saveComment',
    }
    
})
//getting user name

var profile
function get_username(id)
{
    var name
    $.ajax({
        url:'/blog/api/username/'+id,
        type:'get',
        success:function(data)
        {
         profile = new ProfileView({el:$("#main_view"),id:id,name:String(data)})
        }

    })
}
//routes

var AppRouter = Backbone.Router.extend({
    routes: {
        "people":"renderPeople",
        "profile/:id":"renderProfile",
        "*actions": "defaultRoute"
        // matches http://example.com/#anything-here
    }
});
var user_view
var friend_view
// Initiate the router
var app_router = new AppRouter;

app_router.on('route:defaultRoute', function(actions) {
    if (peopleView)
        peopleView.remove()
    if(profile)
        profile.remove()
    if(blog_view)
        blog_view.remove()
    if(user_view)
        user_view.remove()

    blog_view = new BlogView({el : $("#blog_view")})
    user_view = new UserView({el:$("#user_view")})

});
 var peopleView;

app_router.on('route:renderPeople', function(actions) {
    if(blog_view && user_view) {
        blog_view.remove()
        user_view.remove()
    }
         peopleView = new PeopleView({el:$("#main_view")})
});
app_router.on('route:renderProfile',function(id)
{
    if(user_view)
        user_view.remove()
    if(blog_view)
        blog_view.remove()
    if(peopleView)
        peopleView.remove()
    get_username(id)


})

// Start Backbone history a necessary step for bookmarkable URL's
Backbone.history.start();



