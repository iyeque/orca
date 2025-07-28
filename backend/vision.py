from fastapi import UploadFile
import random

def count_stock_from_image(file: UploadFile):
    # In a real app, use computer vision here
    return {'stock_count': random.randint(10, 100)} 