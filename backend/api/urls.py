from django.urls import path
from . import views
from . import schema_views
from . import review_views
from . import session_views
from . import lookup_views

urlpatterns = [
    path('upload/', views.upload_file, name='upload_file'),
    path('schemas/<str:file_type>/', schema_views.manage_schema, name='manage_schema'),
    path('records/<str:file_type>/', review_views.get_records, name='get_records'),
    path('records/<str:file_type>/review/', review_views.review_records, name='review_records'),
    path('sessions/', session_views.get_sessions, name='get_sessions'),
    path('lookups/', lookup_views.manage_lookups, name='manage_lookups'),
    path('lookups/<str:name>/', lookup_views.get_lookup, name='get_lookup'),
]
