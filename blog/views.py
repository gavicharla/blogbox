from django import template
from django.contrib.auth.decorators import login_required
from django.shortcuts import render
# Create your views here.
from django.template import loader
from blog.models import Blog
from django.http import HttpResponse
from forms import *
from django.views.decorators.csrf import csrf_exempt
from django.template import RequestContext
from django.contrib.auth import *
from django.core.urlresolvers import *
from django.shortcuts import redirect
from serializers import *
from django.core import serializers
from itertools import chain
def home(request):
    if(request.method == 'GET'):
        if(request.user.is_authenticated() ):
            tempate = loader.get_template('index.html')
            friends_1 = Friend.objects.filter(user = request.user).values_list('friend',flat = True)
            friends_2 = Friend.objects.filter(friend= request.user).values_list('user',flat = True)
            friends_list = list(chain(friends_1,friends_2))
            friends_list.append(request.user.id)
            blogs = Blog.objects.filter(user_id__in= friends_list).order_by('created')
            comment = AddComment()
            message = ''
            if 'message' in request.session:
                message = request.session['message']
                del request.session['message']
            result = tempate.render(context = {'blogs' : blogs,'comment':comment,'user':request.user,'message':message})
        else:
            template = loader.get_template('index.html')
            blogs = Blog.objects.all().order_by('created')
            result = template.render(context = {'blogs':blogs})
        return HttpResponse(result)
@csrf_exempt
def add_user(request,message=None):
    if (not(request.user.is_authenticated() and request.user.is_active)):
        if (request.method == 'GET'):
            tempate = loader.get_template('add_user.html')
            form = UserForm()
            result = tempate.render(context = {'form':form})
            return HttpResponse(result)
        else:
            form = UserForm(request.POST)
            if(form.is_valid()):
                user = User.objects.create_user(form.cleaned_data['username'],form.cleaned_data['email'],form.cleaned_data['password'])
                user.save()
                username = form.cleaned_data['username']
                password = form.cleaned_data['password']
                user = authenticate(username=username, password=password)
                if user:
                    if user.is_active:
                        login(request, user)
                        request.session['message'] = 'Succesfully Signed up!!'
                        return redirect('blog.views.home',context_instance=RequestContext(request) )
                request.session['message'] = 'No User Found!!'
                return redirect('blog.views.home')
            else:
                request.session['message']='Fill out the details again!!'
                return redirect('blog.views.add_user')
    else:
        return redirect('blog.views.home')
@csrf_exempt
def check_user(request):
    if(request.method=='GET'):
        if request.user.is_authenticated():
            return redirect('blog.views.home')
        template = loader.get_template("login.html")
        form = LoginForm()
        result = template.render(context={'form':form})
        return HttpResponse(result)
    else:
        username = request.POST['username']
        password = request.POST['password']
        user = authenticate(username=username, password=password)
        if user:
            if user.is_active:
                login(request, user)
                request.session['message'] = 'Succesfully Logged in!!'
                return redirect('blog.views.home',context_instance=RequestContext(request))
                #return HttpResponse(str(request.user.id))
            else:
                return HttpResponse('not active')
        else:
            request.session['message'] = 'Invalid Credentials !!Try logging in again'
            return redirect('blog.views.home')


@csrf_exempt
def logout_view(request):
    logout(request)
    request.session['message'] = 'Logged out Now!!'
    return redirect('blog.views.home')
#all apis start here

from rest_framework import status
from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework.authentication import SessionAuthentication,BasicAuthentication

class CsrfExemptSessionAuthentication(SessionAuthentication):

    def enforce_csrf(self, request):
        return  # To not perform the csrf check previously happening

@api_view(['GET','POST'])
@csrf_exempt
def api_blog(request,id=None):
    authentication_classes = (CsrfExemptSessionAuthentication, BasicAuthentication)
    if (request.method == 'GET'):
        if(request.user.is_authenticated()):
            if not id:
                friends_1 = Friend.objects.filter(user=request.user).values_list('friend', flat=True)
                friends_2 = Friend.objects.filter(friend=request.user).values_list('user', flat=True)
                friends_list = list(chain(friends_1, friends_2))
                friends_list.append(request.user.id)
                blogs = Blog.objects.filter(user__in=friends_list).order_by('-created')
            else:
                blogs = Blog.objects.filter(user__id= id).order_by('-created')
        else:
            blogs = Blog.objects.all().order_by('-created')
        serializer = BlogSerializer(blogs, many=True)
        return Response(serializer.data)
    else:
        if (request.user.is_active and request.user.is_authenticated()):
                blog = Blog()
                blog.user = request.user
                blog.title = request.data['title']
                blog.content = request.data['content']
                blog.save()
                return Response('1')
        else:
                return Response(status = status.HTTP_400_BAD_REQUEST)

@api_view(['DELETE','PUT'])
@csrf_exempt
def api_edit_blog(request,id):
    if(request.method == 'DELETE'):
        if (request.user.is_authenticated() and request.user.is_active):
            blog = Blog.objects.filter(id=id)
            like = Like.objects.filter(blog=blog)
            comment = Comment.objects.filter(blog=blog)
            like.delete()
            comment.delete()
            blog.delete()
            return Response('1')


    else:
        if (request.user.is_authenticated() and request.user.is_active):
            blog = Blog.objects.filter(id = id)
            blog.title = request.data['title']
            blog.content = request.data['content']
            blog.save()
            return Response('1')
    return Response(status=status.HTTP_400_BAD_REQUEST)
@api_view(['GET','POST','PUT'])
@csrf_exempt
@login_required(login_url='/blog/login/')
def api_like(request,id):
    if(request.method == 'GET'):
        like_count = Like.objects.filter(blog__id=id).count()
        temp = Like_count()
        temp.like_count = like_count
        temp.blog_id = id
        serializer = LikeSerializer(temp)
        return Response(serializer.data)
    else:
        if(request.user.is_authenticated() and request.user.is_active):
            like = Like()
            temp = Like.objects.filter(user = request._user).filter(blog__id = id)
            if(temp):
                temp.delete()
            else:
                like.user = request._user
                like.blog = Blog.objects.filter(id =id)[0]
                like.save()
            like_count = Like.objects.filter(blog__id=id).count()
            temp = Like_count()
            temp.like_count = like_count
            temp.blog_id = id
            serializer = LikeSerializer(temp)
            return Response(serializer.data)
        else:
            return Response(status= status.HTTP_400_BAD_REQUEST)

@api_view(['GET','POST'])
@csrf_exempt
def api_show_users(request):
    if(request.method == 'GET' ):
        if(request.user.is_authenticated() and request.user.is_active):
            friends = Friend.objects.filter(user=request.user).values_list('friend', flat=True)
            users = User.objects.exclude(id = request.user.id).order_by('username')
            user_serial = UserSerializer(users,many=True)
            return Response(user_serial.data)
        else:
            user = UserSerializer(User.objects.all(),many=True)
            return Response(user.data)

@api_view(['GET','POST','PUT','DELETE'])
@csrf_exempt
def api_comment(request,id):
    if(request.method == 'GET'):
        comments = Comment.objects.filter(blog__id = id).order_by('-created')
        comment_serializer = CommentSerializer(comments,many = True)
        print comment_serializer.data
        return Response(comment_serializer.data)
    elif(request.method == 'DELETE'):
        comment = Comment.objects.filter(id = id)[0]
        if(comment):
            comment.delete()
        return Response('1')
    else:
        if request.user.is_authenticated() and request.user.is_active:
            comment = Comment()
            comment.user = request.user
            comment.blog = Blog.objects.get(id =id)
            comment.comment = request.data['comment']
            comment.save()
            return Response('1')
        else:
            return Response(status=status.HTTP_400_BAD_REQUEST)

@api_view(['GET','POST'])
@csrf_exempt
def api_check_friend(request):
    if(request.method == 'POST' and request.user.is_authenticated() and request.user.is_active):
        friend = UserSerializer(request.data)
        if Friend.objects.filter(friend = request.data['id']).filter(user = request.user):
            return Response("1")
        else:
            return Response("-1")
    else:
        return Response(status=status.HTTP_400_BAD_REQUEST)

@api_view(['GET','POST'])
@csrf_exempt
def api_add_friend(request):
    if(request.method== 'POST' and request.user.is_authenticated() and request.user.is_active):

        if(Friend.objects.filter(friend = request.data['id']).filter(user= request.user)):
            friend = Friend.objects.filter(friend = request.data['id']).filter(user= request.user)
            friend.delete()
            return Response(-1)
        else:
            friend = Friend(friend = User.objects.filter(id = request.data['id'])[0],user = request.user)
            friend.save()
            return Response(1)
    else:
        return Response(status=status.HTTP_400_BAD_REQUEST)

@api_view(['PUT'])
@csrf_exempt
def api_edit_comments(request,id):
    if(request.user.is_authenticated() and request.user.is_active):
        print id
        id = int(id)
        print id
        comment = Comment.objects.filter(id = id)[0]
        comment.comment = request.data['comment']
        comment.save()
        return Response('1')

@api_view(['GET'])
@csrf_exempt
def api_auth_user(request):
    if(request.user.is_authenticated() and request.user.is_active):
        user_details = User_details()
        user_details.blog_count = Blog.objects.filter(user = request.user).count()
        print Blog.objects.filter(user = request.user).count()
        user_details.like_count = Like.objects.filter(user = request.user).count()
        user_details.following = Friend.objects.filter(user = request.user)
        user_details.followed_by = Friend.objects.filter(friend=request.user)
        user_details_serial = User_detail_Serializer(user_details)
        return Response(user_details_serial.data)

    else:
        return Response(status=status.HTTP_400_BAD_REQUEST)
@api_view(['GET'])
@csrf_exempt
def get_username(request,id):
    return Response(User.objects.get(id = id).username)



