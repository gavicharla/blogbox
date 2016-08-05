from __future__ import unicode_literals

import datetime
from django.db import models
from django.contrib.auth.models import User

class Blog(models.Model):
    id = models.AutoField(primary_key=True)
    title = models.CharField(max_length=50)
    user = models.ForeignKey(User)
    content = models.CharField(max_length=1024)
    created = models.DateTimeField(default=datetime.datetime.now)
    updated = models.DateTimeField(default=datetime.datetime.now)

class Like(models.Model):
    user = models.ForeignKey(User)
    blog = models.ForeignKey(Blog)

class Comment(models.Model):
    id = models.AutoField(primary_key=True)
    user = models.ForeignKey(User)
    comment = models.CharField(max_length=1024)
    blog = models.ForeignKey(Blog)
    created = models.DateTimeField(default=datetime.datetime.now)

class Like_count(models.Model):
    like_count = models.IntegerField()
    blog_id = models.IntegerField()

class User_details(models.Model):
    blog_count = models.IntegerField()
    like_count = models.IntegerField()

class Friend(models.Model):
    user = models.ForeignKey(User)
    friend = models.ForeignKey(User, related_name="friends")
    user_details = models.ForeignKey(User_details,name='user_details',null=True)