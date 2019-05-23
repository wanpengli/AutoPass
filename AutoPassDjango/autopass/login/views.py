# from django.shortcuts import render
from django.http import HttpResponse
from django.conf import settings
# from django.shortcuts import render
from django.template.response import TemplateResponse
from django.shortcuts import redirect
from django.contrib.auth import logout, authenticate
from django.http import JsonResponse
from django.core.exceptions import ObjectDoesNotExist
from django.views.decorators.csrf import csrf_protect, csrf_exempt

import requests

from .models import AutoPassUser, AutoPassPPD
from .utils import get_client_ip
# Create your views here.
# def login(request):
#     return render(request, 'registration/login.html')


def profile(request):
    if request.user.is_authenticated:
        username = request.user

        user = AutoPassUser.objects.get(username=username)
        # print(user.has_perm('login.delete_autopassppd'))
        return TemplateResponse(request, 'registration/home.html', {'user': user})
    else:
        return redirect('/login')


def logout_view(request):
    logout(request)
    return redirect('/login')


@csrf_protect
def register(request):
    if request.user.is_authenticated:
        return redirect('/user/profile')
    else:
        if request.method == "POST":
            response = {}
            data = request.POST
            captcha_rs = data.get('g-recaptcha-response')
            url = "https://www.google.com/recaptcha/api/siteverify"
            params = {'secret': settings.RECAPTCHA_PRIVATE_KEY,
                      'response': captcha_rs,
                      'remoteip': get_client_ip(request)}
            verify_rs = requests.get(url, params=params, verify=True)
            verify_rs = verify_rs.json()
            response["status"] = verify_rs.get("success", False)
            response['message'] = verify_rs.get(
                'error-codes', None) or "Unspecified error."
            if response["status"]:
                user_name = request.POST['username']
                password_1 = request.POST['password']
                password_2 = request.POST['_password']
                first_name = request.POST['first_name']
                last_name = request.POST['last_name']
                enc_master_pwd = request.POST['enc_master_pwd']
                hash_master_pwd = request.POST['hash_master_pwd']
                email = request.POST['email']
                print(request.POST)

                if password_1 != password_2:
                    return HttpResponse('<p>Welcome to AutoPass.</p> <p>The two password fields didn\'t match. Please <a href="/register/">Register</a> again.</p>')
                else:
                    try:
                        user = AutoPassUser.objects.get(username=user_name)
                    except ObjectDoesNotExist:
                        user = AutoPassUser.objects.create_user(
                            username=user_name,
                            password=password_1,
                            first_name=first_name,
                            last_name=last_name,
                            enc_master_pwd=enc_master_pwd,
                            hash_master_pwd=hash_master_pwd,
                            email=email)
                        user.save()
                        return HttpResponse('<p>Welcome to AutoPass.</p> <p>You have completed registration. Please <a href="/login/">Log in</a>.</p>')
                    else:
                        return HttpResponse('<p>Welcome to AutoPass.</p> <p>The username is existing. Please <a href="/register/">Register</a> again.</p>')
            else:
                return HttpResponse('<p>Welcome to AutoPass.</p> <p>The reCAPTCHA is invalid. Please <a href="/register/">Register</a> again.</p>')

        else:
            return TemplateResponse(request, 'registration/register.html', {})


def check_username(request):
    if request.method == "GET":
        user_name = request.GET['username']
        if user_name:
            try:
                AutoPassUser.objects.get(username=user_name)
            except ObjectDoesNotExist:
                return JsonResponse({'isAvailable': True})
            else:
                return JsonResponse({'isAvailable': False})
        else:
            return HttpResponse('<p>Please give a correct user name.</p>')
    else:
        return HttpResponse('<p>POST Method is not allowed to retrieve this data.</p>')


def manage_user_accounts(request):
    if request.user.is_authenticated:
        username = request.user.username
        all_accounts = AutoPassPPD.objects.filter(username=username)
        accounts = {}
        for account in all_accounts:
            domain = account.domain
            user_account = account.user_account
            pwd_offset = account.pwd_offset
            input_type = account.input_type
            accounts.setdefault(domain, []).append(
                [user_account, pwd_offset, input_type])
        print(accounts)
        return TemplateResponse(request, 'registration/manage.html', {'user_accounts': accounts})
    else:
        return HttpResponse('<p>Welcome to AutoPass.</p> <p>You have not logged in to AutoPass. Please <a href="/login/">log in</a> or <a href="/register/">sign up</a>.</p>')


@csrf_exempt
def delete_user_accounts(request):
    if request.user.is_authenticated:
        username = request.user.username
        account_name = request.GET['account_name']
        domain = request.GET['domain']
        if account_name and domain:
            if AutoPassPPD.objects.filter(username=username, domain=domain, user_account=account_name).exists():
                AutoPassPPD.objects.filter(
                    username=username, domain=domain, user_account=account_name).delete()
        return redirect('/manage')
    else:
        return HttpResponse('<p>Welcome to AutoPass.</p> <p>You have not logged in to AutoPass. Please <a href="/login/">log in</a> or <a href="/register/">sign up</a>.</p>')


@csrf_exempt
def retrieve_ppd(request):
    if request.method == 'POST':
        username = request.POST['username']
        password = request.POST['password']
        user = authenticate(username=username, password=password)
        if user is not None:
            autopass_user = AutoPassUser.objects.get(username=username)
            all_accounts = AutoPassPPD.objects.filter(username=username)
            accounts = {}
            for account in all_accounts:
                domain = account.domain
                user_account = account.user_account
                pwd_offset = account.pwd_offset
                input_type = account.input_type
                accounts.setdefault(domain, []).append(
                    [user_account, pwd_offset, input_type])

            return JsonResponse({'isUserExsit': True,
                                 "username": username,
                                 "first_name": autopass_user.first_name,
                                 "last_name": autopass_user.last_name,
                                 "enc_master_pwd": autopass_user.enc_master_pwd,
                                 "hash_master_pwd": autopass_user.hash_master_pwd,
                                 "email": autopass_user.email,
                                 "user_accounts": accounts})
        else:
            return JsonResponse({'isUserExsit': False})


def privacy_policy(request):
    return TemplateResponse(request, 'privacy_policy.html', {})


@csrf_exempt
def update_user_accounts(request):
    # pwd_offest and input_type has not been implemented
    if request.method == 'POST':
        username = request.POST['username']
        password = request.POST['password']
        domain = request.POST['domain']
        user_account = request.POST['user_account']
        password_offset = request.POST['pwd_offset']

        user = authenticate(username=username, password=password)
        if user is not None:
            if AutoPassPPD.objects.filter(username=username, domain=domain, user_account=user_account).exists():
                if password_offset != "undefined":
                    AutoPassPPD.objects.filter(username=username, domain=domain, user_account=user_account).update(pwd_offset=password_offset)
                    return JsonResponse({"update_status": "success"})
                else:
                    return JsonResponse({"update_status": "failed", "reason": "password_offset_exists"})
            else:
                user_account = AutoPassPPD(
                    username=username, domain=domain, user_account=user_account, pwd_offset=password_offset)
                user_account.save()
                return JsonResponse({"update_status": "success"})
        else:
            return JsonResponse({"update_status": "failed", "reason": "user_authentication_failed"})
