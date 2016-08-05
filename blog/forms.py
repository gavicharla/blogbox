from django.forms import ModelForm
from django.contrib.auth.models import User
from models import *
import django
class UserForm(django.forms.ModelForm):
    class Meta:
        model = User
        fields = ['username','password','email']

class LoginForm(django.forms.ModelForm):
    class Meta:
        model = User
        fields = ['username','password']

class AddBlog(django.forms.ModelForm):
    class Meta:
        model = Blog
        fields = ['title','content','created','updated']

class AddComment(django.forms.ModelForm):
    class Meta:
        model = Comment
        fields = ['user','comment','created','blog']