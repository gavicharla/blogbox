from django.conf.urls import url
from . import views
urlpatterns = [
    url(r'^home/',views.home,name='home'),
    url(r'^add_user/',views.add_user,name='add_user'),
    url(r'^login/',views.check_user,name='login'),
    url(r'^logout/',views.logout_view,name='logout'),
    url(r'^api/all_blogs/(?P<id>[0-9]*)',views.api_blog,name = 'api_blog'),
    url(r'^api/auth_user/',views.api_auth_user,name='user_details'),
    url(r'^api/edit_blog/(?P<id>[0-9]+)',views.api_edit_blog,name = 'api_blog'),
    url(r'^api/likes/(?P<id>[0-9]+)',views.api_like,name='api_likes'),
    url(r'^api/all_comments/(?P<id>[0-9]+)',views.api_comment,name='api_comments'),
    url(r'^api/all_users/',views.api_show_users,name='api_all_users'),
    url(r'^api/check_friend/',views.api_check_friend,name='check_friend'),
    url(r'^api/add_friend/',views.api_add_friend,name='add_friend'),
    url(r'^api/edit_comments/(?P<id>[0-9]+)',views.api_edit_comments,name='edit_comments'),
    url(r'^api/username/(?P<id>[0-9]+)',views.get_username,name='get_username')

]
