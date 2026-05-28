"""
URL configuration for config project.

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/6.0/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""


from django.urls import path, include, re_path
from django.conf import settings
from django.http import HttpResponse
import os

def serve_react_index(request):
    index_path = os.path.join(getattr(settings, 'FRONTEND_DIST', ''), 'index.html')
    if os.path.exists(index_path):
        with open(index_path, 'r') as f:
            return HttpResponse(f.read(), content_type='text/html')
    return HttpResponse("Frontend build not found. Run 'pnpm run build' in the frontend directory.", status=404)

urlpatterns = [
    path("api/", include("api.urls")),
    re_path(r"^(?!api/).*$", serve_react_index),
]
