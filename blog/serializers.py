from rest_framework import serializers

from models import *
class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['username', 'email', 'id']

class BlogSerializer(serializers.ModelSerializer):
    user = UserSerializer()
    class Meta:
        model = Blog
        fields = ['title', 'content','created', 'updated','id','user']

class LikeSerial(serializers.ModelSerializer):
    blog = BlogSerializer()
    user = UserSerializer()
    class Meta:
        model = Like
        fields = ['blog','user']

class LikeSerializer(serializers.ModelSerializer):
    class Meta:
        model = Like_count
        fields = ['like_count','blog_id']

class CommentSerializer(serializers.ModelSerializer):
        blog = BlogSerializer()
        user = UserSerializer()
        class Meta:
                model = Comment
                fields = ['comment','created','blog','user','id']
class FriendSerializer(serializers.ModelSerializer):
    friend = UserSerializer()
    user = UserSerializer()
    class Meta:
        model = Friend
        fields = ['user','friend']
class User_detail_Serializer(serializers.ModelSerializer):
    following = FriendSerializer(many=True)
    followed_by = FriendSerializer(many=True)
    class Meta:
        model = User_details
        fields = ['blog_count','like_count','following','followed_by']
