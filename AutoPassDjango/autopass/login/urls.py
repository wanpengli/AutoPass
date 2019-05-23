from django.urls import path
from django.contrib.auth import views as auth_views

from . import views

urlpatterns = [
    path('', views.profile),
    path('login/', auth_views.LoginView.as_view(template_name='registration/login.html'), name='login'),
    path('user/profile/', views.profile, name='profile'),
    path('logout/', views.logout_view, name='logout'),
    path('register/', views.register, name='register'),
    path('checkaccount/', views.check_username, name='checkaccount'),
    path('autopasslogin/', views.retrieve_ppd, name='autopasslogin'),
    path('autopass_update_account/', views.update_user_accounts, name='autopass_update_account'),
    path('manage/', views.manage_user_accounts, name='manage'),
    path('delete/', views.delete_user_accounts, name='delete'),
    path('privacy_policy/', views.privacy_policy, name='privacy_policy')
]
