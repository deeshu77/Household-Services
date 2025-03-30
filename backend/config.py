class config():
    DEBUG = False
    SQL_ALCHEMY_TRACK_MODIFICATIONS = False

class LocalDevelopmentConfig(config):
    SQLALCHEMY_DATABASE_URI = "sqlite:///database.sqlite3"
    DEBUG = True
    SECURITY_PASSWORD_HASH = "bcrypt"
    SECURITY_PASSWORD_SALT = 'thisshouldbekeptsecret'
    SECRET_KEY = 'shouldbekeyveryhidden'
    SECURITY_TOKEN_AUTHENTICATION_HEADER= 'Authentication-Token'
    SECURITY_REDIRECT_BEHAVIOR = None
   
    CACHE_TYPE = 'RedisCache'
    CACHE_DEFAULT_TIMEOUT = 30
    CACHE_REDIS_PORT = 6379

    WTF_CSRF_ENABLED = False