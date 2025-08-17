import datetime

def predict_runout(current_quantity: int, daily_consumption: int = 50):
    """
    Predicts the date when the inventory will run out, based on a simple daily consumption rate.
    """
    if daily_consumption is None or daily_consumption <= 0:
        return None
    days_left = current_quantity / daily_consumption
    runout_date = datetime.datetime.now() + datetime.timedelta(days=days_left)
    return runout_date.isoformat()
