from django.http import HttpRequest, HttpResponse

def index(request:HttpRequest):
    return HttpResponse("<h1>Hell, I'm Sam TSAI</h1>")